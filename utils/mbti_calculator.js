export function calculateMBTI(responses) {
  const score = {
    EI: 0,
    SN: 0,
    TF: 0,
    JP: 0,
  };

  responses.forEach(({ value, dimension, reverse }) => {
    const normalizedValue = reverse ? -value : value;
    score[dimension] += normalizedValue;
  });

  return [
    score.EI > 0 ? "E" : "I",
    score.SN > 0 ? "S" : "N",
    score.TF > 0 ? "T" : "F",
    score.JP > 0 ? "J" : "P"
  ].join("");
} 