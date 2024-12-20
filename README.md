# 3D Multiplayer Game with React Three Fiber

A real-time multiplayer 3D game built using modern web technologies. Players can join a shared 3D space, move around, and see other players' movements and animations in real-time.

## 🚀 Features

- Real-time multiplayer interaction using WebSocket
- 3D character controls with animations
- User authentication with Clerk
- Physics-based movement using Rapier
- Smooth character and camera controls
- Player name tags and state synchronization

## 🛠️ Tech Stack

- React + TypeScript + Vite
- Three.js with React Three Fiber
- @react-three/drei for 3D utilities
- @react-three/rapier for physics
- WebSocket for real-time communication
- Clerk for authentication
- Zustand for state management
- Tailwind CSS for styling

## 🚦 Getting Started

1. Clone the repository:

   ```bash
   git clone [repository-url]
   cd [repository-name]
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start WebSocket server. Create a file named `server.ts` with the following:

   - Create Node js project
   - Add the below code in server.ts file in root of the project

     ```typescript
     import { WebSocketServer, WebSocket } from "ws";

     // Create a WebSocket server
     const wss = new WebSocketServer({ port: 8080 });

     // Track clients with their WebSocket instances and player data
     interface Player {
       player_username: string;
       position: { x: number; y: number; z: number };
       rotation: number;
       animation: string;
       last_update: number;
     }

     interface PlayerData {
       ws: WebSocket;
       playerId: string;
       player_data: Player;
     }

     const coordinates_pool = [
       {
         x: 1,
         y: -1,
         z: 0,
         model_location: "./fall_guy.glb",
       },
       {
         x: 5,
         y: -1,
         z: 0,
         model_location: "./fall_guy_1.glb",
       },
     ];

     let currentIndex = 0;

     // Map to store active players: playerId -> PlayerData
     const connected_players = new Map<string, PlayerData>();

     wss.on("connection", (ws) => {
       console.log("A client connected");
       let playerId: string;
       let player_username: string;

       ws.on("message", (message) => {
         console.log("--", message.toString());
         const data = JSON.parse(message.toString());

         if (data.type === "init") {
           playerId = data.playerId;
           player_username = data.player_username;
           const assignedCoordinates = coordinates_pool[currentIndex];
           currentIndex = (currentIndex + 1) % coordinates_pool.length;

           const initial_player = {
             position: assignedCoordinates,
             player_username,
             rotation: 0,
             animation: "idle",
             last_update: Date.now(),
           };

           // Store player data
           connected_players.set(playerId, {
             ws,
             playerId,
             player_data: initial_player,
           });

           // Send initial setup to the new player
           ws.send(
             JSON.stringify({
               type: "init",
               player_data: initial_player,
               // Send list of all existing players
               existingPlayers: Array.from(connected_players.entries())
                 .map(([id, data]) => ({
                   playerId: id,
                   player_data: data.player_data,
                 }))
                 .filter((player) => player.playerId !== playerId), // Exclude the current player
             })
           );

           // Broadcast new player to all other clients
           broadcastToOthers(ws, {
             type: "playerJoined",
             playerId,
             player_username,
             position: assignedCoordinates,
           });

           return;
         }

         // Forward other messages to all clients
         broadcastToAll(data);
       });

       ws.on("close", (code) => {
         console.log(
           `Client disconnected - Code: ${code}, PlayerId: ${playerId}`
         );
         if (playerId) {
           connected_players.delete(playerId);

           // Broadcast disconnect to all remaining clients
           broadcastToAll({
             type: "playerDisconnected",
             playerId: playerId,
           });

           console.log(
             "Remaining players:",
             Array.from(connected_players.keys())
           );
         }
       });
     });

     // Utility function to broadcast to all clients except sender
     function broadcastToOthers(senderWs: WebSocket, data: any) {
       wss.clients.forEach((client) => {
         if (client !== senderWs && client.readyState === WebSocket.OPEN) {
           client.send(JSON.stringify(data));
         }
       });
     }

     // Utility function to broadcast to all clients
     function broadcastToAll(data: any) {
       wss.clients.forEach((client) => {
         if (client.readyState === WebSocket.OPEN) {
           client.send(JSON.stringify(data));
         }
       });
     }

     console.log("WebSocket server is running on ws://localhost:8080");
     ```

   - Start the websocket Server
     ```bash
     npm start
     ```

4. Start the Frontend development server:
   ```bash
   npm run dev
   ```
5. It runs on http://localhost:5173/

## 🎮 Controls

- W/Arrow Up: Move forward
- S/Arrow Down: Move backward
- A/Arrow Left: Turn left
- D/Arrow Right: Turn right
- Space: Jump
- Shift: Run

## 📁 Project Structure

```
project-root/
├── src/
│   ├── components/
│   ├── hooks/
│   ├── store/
│   └── types/
├── server/
│   └── server.ts
├── public/
└── ...configuration files
```

## ⚙️ Configuration

The project uses several configuration files:

- `vite.config.ts` - Vite configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `tsconfig.json` - TypeScript configuration

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
