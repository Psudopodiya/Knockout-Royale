import { create } from "zustand";
// import { Vector3 } from "@react-three/fiber";
import { Vector3 } from "three";
import { WebSocketService } from "@/services/websocket/websocket";

type Player = {
  player_id: string;
  player_username: string;
  player_position: Vector3;
  player_rotation: Vector3;
  animation: string;
  last_update: number;
};

type PlayerStore = {
  players: Player[];
  local_player_id: string;
  local_player_data: Player | null;
  setLocalPlayerId: (id: string) => void;
  setLocalPlayerData: (data: Player) => void;
  updateLocalPlayerData: (data: Player) => void;
  addPlayer: (player: Player) => void;
  updatePlayer: (player: Player) => void;
  removePlayer: (player_id: string) => void;
  wsConnection: WebSocketService | null;
  setWsConnection: (ws: WebSocketService) => void;
};

const usePlayerStore = create<PlayerStore>((set) => ({
  players: [],
  local_player_data: null,
  local_player_id: "",

  wsConnection: null,
  setWsConnection: (ws: WebSocketService) => set({ wsConnection: ws }),

  setLocalPlayerId: (id) => set(() => ({ local_player_id: id })),

  setLocalPlayerData: (data) => set(() => ({ local_player_data: data })),

  addPlayer: (player) =>
    set((state) => ({ players: [...state.players, player] })),

  updateLocalPlayerData: (data) =>
    set((state) => ({
      local_player_data:
        state.local_player_data?.player_id === data.player_id
          ? data
          : state.local_player_data,
    })),

  updatePlayer: (player) =>
    set((state) => ({
      players: state.players.map((p) =>
        p.player_id === player.player_id ? player : p
      ),
    })),
  removePlayer: (player_id) =>
    set((state) => ({
      players: state.players.filter((p) => p.player_id !== player_id),
    })),
}));

export default usePlayerStore;
