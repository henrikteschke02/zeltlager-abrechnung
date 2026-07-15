import LiquidLoader from "@/components/ui-verse/LiquidLoader";

export default function DashboardLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-8 bg-transparent p-4">
      <LiquidLoader />
      <p className="text-sm font-sans uppercase tracking-[0.3em] text-[#E5E4DE]/70 font-medium animate-pulse">
        LOADING
      </p>
    </div>
  );
}
