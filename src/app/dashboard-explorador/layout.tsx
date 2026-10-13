import DashboardExploradorClient from "./DashboardExploradorClient";

export default function DashboardExploradorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardExploradorClient nomeExplorador="Explorador">
      {children}
    </DashboardExploradorClient>
  );
}