import SearchBar from "@/components/shared/SearchBar";

const Home = () => {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col justify-center px-4 text-center">
      <div className="animate-in fade-in slide-in-from-bottom-2">
        <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
          Welcome to Github repository explorer
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Explore any GitHub user's repositories — stars, forks, languages and
          activity, all in one view.
        </p>
      </div>
      <div className="pt-4">
        <SearchBar />
      </div>
    </main>
  );
};

export default Home;
