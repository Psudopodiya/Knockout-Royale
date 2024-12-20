// src/App.tsx
import {
  SignedIn,
  SignedOut,
  SignInButton,
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

    // set local player id to store
    // console.log("user", user.username);

    setLocalPlayerId(user.id);

    // initialize if it does not exist
    if (!wsRef.current) {
      wsRef.current = new WebSocketService(
        "ws://localhost:8080",
        user.id,
        user.username
      );
      setWsConnection(wsRef.current);
    }

    // send connection message to server,
    // recieve initial connection message from server
    // i.e message b/w this client and server and set the initial coordinates

    // Listen for player updates from other players

    // Clean up when user logs out or component unmounts
    return () => {
      if (wsRef.current) {
        wsRef.current.disconnect();
        wsRef.current = null;
      }
    };
  }, [user, setLocalPlayerId, isLoaded, user?.username, setWsConnection]);

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <SignedOut>
        <SignInButton />
      </SignedOut>
      <SignedIn>
        <div className="flex gap-5">
          <UserButton />
          <div>{user?.id}</div>
        </div>
        <MainLayout />
      </SignedIn>
    </div>
  );
}

export default App;
