import api from "./apiClient";

export interface ProfileData {
  id: string;
  name: string;
  role: string;
  imoNumber: string;
  crewId: string;
  profilePicture: string | null;
}

export async function getProfile(): Promise<ProfileData> {
  const res = await api.get<ProfileData>("/profile");
  return res.data;
}

export async function uploadProfilePicture(
  base64Image: string
): Promise<{ profilePicture: string; message: string }> {
  const res = await api.patch("/profile/picture", { image: base64Image });
  return res.data;
}
