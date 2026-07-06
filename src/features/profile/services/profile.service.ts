import { api } from "@/lib/api"

import type {
  Profile,
  UpdateProfileDto,
} from "../types/profile.types"

export const profileService = {

  async getProfile(): Promise<Profile> {

    const { data } =
      await api.get("/auth/me")

    return data.user

  },

  async updateProfile(
    dto: UpdateProfileDto,
  ): Promise<Profile> {

    const { data } =
      await api.patch(
        "/users/profile",
        dto,
      )

    return data

  },

  async uploadAvatar(
    imageBase64: string,
  ): Promise<{ avatarUrl: string }> {

    const { data } =
      await api.post(
        "/users/avatar",
        { imageBase64 },
      )

    return data

  },

  async removeAvatar(): Promise<void> {

    await api.delete("/users/avatar")

  },

}