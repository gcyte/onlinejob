import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Invalid credentials");
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                    include: {
                        freelancerProfile: { select: { avatarUrl: true } },
                        employerProfile: { select: { companyLogo: true } },
                    }
                });

                if (!user || !user.password) {
                    throw new Error("Invalid credentials");
                }

                // Block banned users from logging in
                if ((user as any).isBanned) {
                    throw new Error("Your account has been suspended. Please contact support.");
                }

                const isPasswordCorrect = await bcrypt.compare(
                    credentials.password,
                    user.password
                );

                if (!isPasswordCorrect) {
                    throw new Error("Invalid credentials");
                }

                // Use profile image if user.image is null
                const profileImage = user.image || user.freelancerProfile?.avatarUrl || user.employerProfile?.companyLogo;

                return {
                    ...user,
                    image: profileImage
                };
            },
        }),
    ],
    callbacks: {
        async session({ session, token }) {
            if (token && session.user) {
                const userId = (token.id as string) || (token.sub as string);
                
                if (userId) {
                    (session.user as any).id = userId;
                    (session.user as any).role = token.role;
                    (session.user as any).isBanned = token.isBanned;

                    // Fetch latest image from token or DB fallback
                    if (!token.image) {
                        const user = await prisma.user.findUnique({
                            where: { id: userId },
                            select: { 
                                image: true,
                                freelancerProfile: { select: { avatarUrl: true } },
                                employerProfile: { select: { companyLogo: true } }
                            }
                        });
                        (session.user as any).image = user?.image || user?.freelancerProfile?.avatarUrl || user?.employerProfile?.companyLogo || null;
                    } else {
                        (session.user as any).image = token.image;
                    }
                }
            }
            return session;
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = (user as any).role;
                token.isBanned = (user as any).isBanned;
                token.image = user.image;
            }
            return token;
        },
    },
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
};
