import LiquidLoader from "@/components/ui-verse/LiquidLoader";

export default function DashboardLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 bg-background">
      <LiquidLoader />
    </div>
  );
}
