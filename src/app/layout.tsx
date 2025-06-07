import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Pokémon Team Planner",
	description: "Create and compare teams from every major Pokémon game.",
};

export default function RootLayout({children}: Readonly<{children: React.ReactNode;}>) {
	return (
		<html lang="en">
			<body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
				<div className="grid items-center justify-items-center min-h-screen min-w-full text-foreground font-[family-name:var(--font-geist-sans)]">
					{children}
				</div>
				<footer>
					<p>Pokémon and its associated properties ©1995 - 2025 Nintendo/Creatures Inc./GAME FREAK inc.</p>
					<p>Solar icon set created by <a href="https://www.figma.com/@480design">480 Design</a>. Used with permission under <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a></p>
				</footer>
			</body>
		</html>
	);
}
