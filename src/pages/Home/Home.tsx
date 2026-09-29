import SearchBar from "@/components/shared/SearchBar";

const Home = () => {
  return (
    <main className="mx-auto px-4 flex min-h-screen max-w-4xl flex-col justify-center">
      <div className="animate-fade-up">
        <h1 className="text-5xl font-bold tracking-tight text-glow sm:text-6xl">
          Welcome to Github repository explorer
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Explore any GitHub user's repositories — stars, forks, languages and
          activity, all in one view.
        </p>
      </div>
      <div className="pt-4">
        <SearchBar />
        {/* store history if have time */}
      </div>
    </main>
  );
};

export default Home;
