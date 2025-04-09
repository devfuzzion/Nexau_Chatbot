import sql from "./db.js";

export const createUser = async ({ storeName, website, products, story }) => {
  try {
    const { rowCount } = await sql.query(
      'INSERT INTO users ("storename", "website", "products", "story") VALUES ($1, $2, $3, $4)',
      [storeName, website, products, story],
    );

    if (rowCount > 0) {
      console.log(`User created successfully: ${storeName}`);
      return { success: true, message: "User created successfully." };
    } else {
      return { success: false, message: "Failed to create user." };
    }
  } catch (err) {
    console.error("Error creating user:", err);
    throw err;
  }
};

export const updateUser = async (
  userId,
  { storeName, website, products, story },
) => {
  try {
    const { rowCount } = await sql.query(
      'UPDATE users SET "storename" = $1, "website" = $2, "products" = $3, "story" = $4 WHERE "userid" = $5',
      [storeName, website, products, story, userId],
    );

    if (rowCount > 0) {
      console.log(`User updated successfully: ${userId}`);
      return { success: true, message: "User updated successfully." };
    } else {
      console.log(`No user found with ID ${userId}.`);
      return { success: false, message: "User not found." };
    }
  } catch (err) {
    console.error("Error updating user:", err);
    throw err;
  }
};

export const getUserById = async (userId) => {
  try {
    const { rows } = await sql.query(
      'SELECT * FROM users WHERE "userid" = $1',
      [userId],
    );

    return rows[0] || null;
  } catch (err) {
    console.error("Error fetching user by ID:", err);
    throw err;
  }
};
