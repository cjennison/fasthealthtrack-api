const generatePrompt = (name: string, type: string) => {
  const prompt = `
  Here is the name of an exercise activity: ${name} with assumed type: ${type}.
  You need to estimate the MET (Metabolic Equivalent of Task) for this exercise activity.
  If there is a range, provide the average of the range.

  provide the following values:
  - name: The corrected spelling of the exercise activity or better naming for it.
  - baseMetabolicRate: The base metabolic rate of the exercise activity.
  - description: A basic description of the exercise activity.

  The object returns should look like: 
  {
    "name": "${name}",
    "baseMetabolicRate": 5,
    "description": "A fun exercise activity"
  }

  It should be a valid JSON String such that JSON.parse is successful. Do not include any other contents than json.
  `;
  return prompt;
};

export default generatePrompt;
