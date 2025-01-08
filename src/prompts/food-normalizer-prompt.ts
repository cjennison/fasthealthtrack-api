const generatePrompt = (name: string) => {
  const prompt = `
  Here is a food item that a user entered: ${name}
  You need to normalize this food item by doing the following:
  - Assume the food item being represented
  - Fix any spelling mistakes in the food item.
  - Clarify the food item's name so it is easier to understand. 


  Return some possible normalized food items that could be used to represent the food item 
  in the form of a JSON array in the format:
  [
    {
      "name": "Normalized Food Item Name1",
    },
     {
      "name": "Normalized Food Item Name2",
    }
  ]

  `;
  return prompt;
};

export default generatePrompt;
