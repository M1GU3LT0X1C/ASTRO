import DashboardClinicaClient from "./DashboardClinicaClient";

export default function DashboardClinicaLayout({ children }: { children: React.ReactNode }) {
  return <DashboardClinicaClient>{children}</DashboardClinicaClient>;
}
