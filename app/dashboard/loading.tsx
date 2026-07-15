export default function DashboardLoading() {
  return (
    <div className="space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="sticky top-16 z-40 bg-background/95 backdrop-blur-sm py-2 -mx-4 px-4 shadow-sm mb-4">
        <div className="h-32 bg-muted rounded-xl animate-pulse w-full"></div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="h-16 bg-muted rounded-xl animate-pulse w-full"></div>
        <div className="h-16 bg-muted rounded-xl animate-pulse w-full"></div>
      </div>
      
      <div>
        <div className="h-6 w-1/3 bg-muted rounded mb-4 animate-pulse"></div>
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-40 bg-muted rounded-2xl animate-pulse w-full"></div>
          ))}
        </div>
      </div>
    </div>
  );
}
