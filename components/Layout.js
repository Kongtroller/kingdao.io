//components\Layout.js

export default function Layout({ children }) {
  return (
    // This layout centers its *direct children* within the screen.
    // If you wrap a full page component here, it might center the entire page content block.
    <div className="min-h-screen items-center justify-center flex flex-col bg-gray-100 dark:bg-gray-950">
      {children}
    </div>
  );
}