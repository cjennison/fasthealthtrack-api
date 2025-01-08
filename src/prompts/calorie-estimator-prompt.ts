const generatePrompt = (name: string) => {
  const prompt = `
  Estimate the calories for this food item: ${name}. 

  You are to generate the following values from this food item:
  - name: The corrected spelling of the food item or better naming for it.
  - caloriesPerUnit: The number of calories in the food item.
  - units: The unit of measurement for the food item (e.g., "serving", "piece", "gram") that is best handled when
    evaluating how much of the food item is consumed. For example, one may eat MANY PIECES of Candy. One May have SOME of a SERVING of Turkey.
    The unit should be such that it can be multiplied by a ratio that is related to the amount the user feels they consumed.
    The units are multiplied by a fraction that best makes sense for the users perception of that food.
    For example, one eats pieces of candy, but servings of turkey.
  - description: A basic description of the food item.

  The object returns should look like: 
  {
    "name": "${name}",
    "caloriesPerUnit": 100,
    "units": "serving",
    "description": "A delicious food item"
  }

  Is should be a valid JSON String such that JSON.parse is successful. Do not include any other contents than json.

  `;
  return prompt;
};

export default generatePrompt;
