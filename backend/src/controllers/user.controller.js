import { updateUser, getUserById } from "../db/user.queries.js";
import { logUserData, getUserData } from "../airtable.utils.js";

export const saveUserDatainDb = async (req, res) => {
  try {
    console.log("api striked /user-questions-data ", req.body);
    const { store_name, website, products, story } = req.body;
    const userId = req.params.userId;
    // if (!storeName || !website || !products || !story) { 
    //   return res
    //     .status(400)
    //     .json({ success: false, message: "Missing required fields." });
    // }

    // const result = await updateUser(userId, {
    //   storeName,
    //   website,
    //   products,
    //   story,
    // });

    logUserData({ userId, store_name, website, products, story });
    return res
      .status(201)
      .json({ success: true, message: "User Data Updated successfully." });

  } catch (error) {
    console.error("Error updating user data:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

export const getUserDataFromDb = async (req, res) => {
  try {
    const userId = req.params.userId;
    // console.log(userId, "from controller");

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "User ID is required." });
    }

    const user = await getUserData(userId);
    // console.log("user_data", user);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error("Error fetching user data:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};
