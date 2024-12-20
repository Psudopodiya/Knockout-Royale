import { Vector3 } from "three";
import usePlayerStore from "@/store/gameStore";

interface PlayerData {
  player_id: string;
  player_username: string;
  position: { x: number; y: number; z: number };
  rotation: number;
  animation: string;
  timestamp: number;
}

export class WebSocketService {
  private ws: WebSocket;
  private localPlayerId: string;
  private localPlayerUsername: string;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;

  constructor(url: string, localPlayerId: string, localPlayerUsername: string) {
    this.localPlayerId = localPlayerId;
    this.localPlayerUsername = localPlayerUsername;
    this.ws = new WebSocket(url);
    this.setupWebSocket();
  }

  private setupWebSocket() {
    this.ws.onopen = () => {
      console.log("WebSocket Connected");
      this.reconnectAttempts = 0;
      this.ws.send(
        JSON.stringify({
          type: "init",
          playerId: this.localPlayerId,
          player_username: this.localPlayerUsername,
        })
      );
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      // console.log("Received message:", data);

      switch (data.type) {
        case "init":
          // console.log("Initialization data received:", data);
          // Handle existing players
          if (data.existingPlayers) {
            data.existingPlayers.forEach((playerInfo: any) => {
              this.addPlayer({
                player_id: playerInfo.playerId,
                player_username: playerInfo.player_username,
                position: playerInfo.player_data.position,
                rotation: playerInfo.player_data.rotation,
                animation: playerInfo.player_data.animation,
                timestamp: playerInfo.player_data.last_update,
              });
            });
          }

          // Set the local player data
          this.setLocalPlayerData({
            player_id: this.localPlayerId,
            player_username: data.player_data.player_username,
            position: data.player_data.position,
            rotation: data.player_data.rotation,
            animation: data.player_data.animation,
            timestamp: data.player_data.last_update,
          });
          break;

        case "playerJoined":
          console.log("New player joined:", data);
          this.addPlayer({
            player_id: data.playerId,
            player_username: data.player_username,
            position: data.position,
            rotation: 0,
            animation: "idle",
            timestamp: Date.now(),
          });
          break;

        case "playerDisconnected":
          // console.log("Player disconnected:", data);
          this.removePlayer(data.playerId);
          break;

        case "playerMoved":
          // Handle player movement updates if needed
          this.updatePlayerPosition(data);
          break;
      }
    };

    this.ws.onclose = () => {
      console.log("WebSocket Disconnected");
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        setTimeout(() => {
          this.ws = new WebSocket(this.ws.url);
          this.setupWebSocket();
        }, 1000 * this.reconnectAttempts);
      }
    };

    this.ws.onerror = (error) => {
      console.error("WebSocket Error:", error);
    };
  }

  private addPlayer(data: PlayerData) {
    if (!data.position) {
      // console.error("Invalid player data - missing position:", data);
      return;
    }

    const { x, y, z } = data.position;
    const positionVector = new Vector3(x, y, z);
    usePlayerStore.getState().addPlayer({
      player_id: data.player_id,
      player_username: data.player_username,
      player_position: positionVector,
      player_rotation: data.rotation,
      animation: data.animation,
      last_update: data.timestamp,
    });
  }

  private setLocalPlayerData(data: PlayerData) {
    const { x, y, z } = data.position;
    const positionVector = new Vector3(x, y, z);
    usePlayerStore.getState().setLocalPlayerData({
      player_id: data.player_id,
      player_username: data.player_username,
      player_position: positionVector,
      player_rotation: data.rotation,
      animation: data.animation,
      last_update: data.timestamp,
    });
  }

  private updatePlayerPosition(data: any) {
    if (!data.position || !data.playerId) return;

    const { x, y, z } = data.position;
    const positionVector = new Vector3(x, y, z);
    usePlayerStore.getState().updatePlayer({
      player_id: data.playerId,
      player_username: data.player_username,
      player_position: positionVector,
      player_rotation: data.rotation,
      animation: data.animation,
      last_update: Date.now(),
    });
  }

  private removePlayer(player_id: string) {
    usePlayerStore.getState().removePlayer(player_id);
  }

  public sendPosition(position: Vector3, rotation: number, animation: string) {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: "playerMoved",
          playerId: this.localPlayerId,
          position: {
            x: position.x,
            y: position.y,
            z: position.z,
          },
          rotation: rotation,
          animation: animation,
          timestamp: Date.now(),
        })
      );
    }
  }

  public disconnect() {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: "playerLeft",
          playerId: this.localPlayerId,
        })
      );
      setTimeout(() => {
        this.ws.close();
      }, 100);
    }
  }
}
