const ROOM_TOKEN_KEY = "cc_room_jwt";

/** Room-scoped JWT from check_guest_authentication / check_patient_authentication. */
export function setRoomToken(token: string): void {
  sessionStorage.setItem(ROOM_TOKEN_KEY, token);
}

export function getRoomToken(): string {
  return sessionStorage.getItem(ROOM_TOKEN_KEY) ?? "";
}

export function clearRoomToken(): void {
  sessionStorage.removeItem(ROOM_TOKEN_KEY);
}
