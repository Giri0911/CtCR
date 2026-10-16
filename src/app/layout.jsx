import "../index.css";
import "../App.css";
import "../redesign.css";

export const metadata = {
  title: "CampusXCompany | Campus-to-career connections",
  description:
    "CampusXCompany brings colleges and employers together to discover verified jobs, internships, and campus hiring opportunities.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
