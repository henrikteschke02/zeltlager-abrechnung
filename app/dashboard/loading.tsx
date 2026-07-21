import CampingLoader from "@/components/ui-verse/CampingLoader";

export default function DashboardLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full overflow-hidden gap-8 bg-transparent p-4">
      <div className="transform scale-[0.6] sm:scale-[0.8] md:scale-100 flex items-center justify-center">
        <CampingLoader />
      </div>
      <p className="text-sm font-sans uppercase tracking-[0.3em] text-[#E5E4DE]/70 font-medium animate-pulse -mt-8 sm:-mt-4 md:mt-0">
        LOADING
      </p>
    </div>
  );
}
