// Display bands applied to the model's probability output.
// Low < 33%, Moderate 33-65%, Higher >= 66%.
exports.levelFromProbability = (p) => (p < 0.33 ? 'Low' : p < 0.66 ? 'Moderate' : 'Higher');
