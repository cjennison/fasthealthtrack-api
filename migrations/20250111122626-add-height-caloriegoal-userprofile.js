module.exports = {
  async up(db) {
    console.log(
      "Starting migration: Adding 'height' and 'calorieGoal' to UserProfiles..."
    );

    try {
      // Add 'height' and 'calorieGoal' to all user profiles
      const result = await db.collection('userprofiles').updateMany(
        {
          $or: [
            { height: { $exists: false } },
            { calorieGoal: { $exists: false } },
          ],
        },
        {
          $set: {
            height: 180, // Default value for height in cm
            calorieGoal: 2000, // Default value for calorieGoal
          },
        }
      );

      console.log(
        `Migration completed: ${result.modifiedCount} documents updated with 'height' and 'calorieGoal'.`
      );
    } catch (error) {
      console.error('Error during migration:', error);
      throw error;
    }
  },

  async down(db) {
    console.log(
      "Starting rollback: Removing 'height' and 'calorieGoal' from UserProfiles..."
    );

    try {
      // Remove 'height' and 'calorieGoal' fields from user profiles
      const result = await db.collection('userprofiles').updateMany(
        {
          $or: [
            { height: { $exists: true } },
            { calorieGoal: { $exists: true } },
          ],
        },
        {
          $unset: {
            height: '', // Remove height field
            calorieGoal: '', // Remove calorieGoal field
          },
        }
      );

      console.log(
        `Rollback completed: ${result.modifiedCount} documents updated by removing 'height' and 'calorieGoal'.`
      );
    } catch (error) {
      console.error('Error during rollback:', error);
      throw error;
    }
  },
};
