export interface UserProfile {
	session: {
		user: {
			id: string;
			createdAt: Date;
			updatedAt: Date;
			email: string;
			emailVerified: boolean;
			name: string;
			image?: string | null;
		};
		session: {
			id: string;
			createdAt: Date;
			updatedAt: Date;
			userId: string;
			expiresAt: Date;
			token: string;
			ipAddress?: string | null;
			userAgent?: string | null;
		};
	} | null;
}