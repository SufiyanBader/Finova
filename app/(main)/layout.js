import Header from "@/components/header";

export default function MainLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto mt-20 mb-12 px-4 md:mt-28 md:mb-20">
        {children}
      </main>
      <footer className="bg-blue-50 py-12">
        <div className="container mx-auto px-4 text-center text-gray-600 font-medium">
          <p>Made with care by the Finova Team</p>
        </div>
      </footer>
    </div>
  );
}
