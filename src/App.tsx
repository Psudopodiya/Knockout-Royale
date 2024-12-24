import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/clerk-react";
import { useUser } from "@clerk/clerk-react";
import { MainLayout } from "@/components/Layout/MainLayout";
import usePlayerStore from "./store/gameStore";
import { useEffect, useRef } from "react";
import { WebSocketService } from "./services/websocket/websocket";

function App() {
  const { user, isLoaded } = useUser();
  const wsRef = useRef<WebSocketService | null>();
  const { setLocalPlayerId, setWsConnection } = usePlayerStore();

  useEffect(() => {
    if (!isLoaded || !user || !user.username) return;

    setLocalPlayerId(user.id);

    if (!wsRef.current) {
      wsRef.current = new WebSocketService(
        "ws://localhost:8080",
        user.id,
        user.username
      );
      setWsConnection(wsRef.current);
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.disconnect();
        wsRef.current = null;
      }
    };
  }, [user, setLocalPlayerId, isLoaded, user?.username, setWsConnection]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <SignedOut>
        <div className="min-h-screen flex flex-col items-center justify-center space-y-6 p-4">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">
              Welcome to Game
            </h1>
            <p className="text-muted-foreground">Sign in to start playing</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <SignInButton mode="modal">
              <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
                Sign Up
              </button>
            </SignUpButton>
          </div>
        </div>
      </SignedOut>
      <SignedIn>
        <div className="flex flex-col min-h-screen">
          <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center justify-between">
              <div className="mr-4 flex">
                <a
                  className="mr-6 flex items-center space-x-2 font-bold"
                  href="/"
                >
                  Game
                </a>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-sm text-muted-foreground">
                  {user?.username}
                </div>
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: "w-8 h-8",
                    },
                  }}
                />
              </div>
            </div>
          </header>
          <main className="flex-1">
            <MainLayout />
          </main>
        </div>
      </SignedIn>
    </div>
  );
}

export default App;
