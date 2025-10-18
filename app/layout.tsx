import "./globals.css";
import HeaderBar from "../components/HeaderBar";
import type { ReactNode } from "react";
export const metadata = { title: "Rental Pro", description: "Beautiful rental management with ROI" };
export default function RootLayout({ children }:{ children:ReactNode }) {
  return (<html lang="en"><body><HeaderBar /><div className="container">{children}</div></body></html>);
}
