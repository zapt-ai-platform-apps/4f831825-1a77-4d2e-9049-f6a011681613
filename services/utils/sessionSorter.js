export function sortBlankSessions(blankSessions) {
  return blankSessions.sort((a, b) => {
    const dA = new Date(a.date);
    const dB = new Date(b.date);
    if (dA - dB !== 0) return dA - dB;

    const blockOrder = { Morning: 0, Afternoon: 1, Evening: 2 };
    return blockOrder[a.block] - blockOrder[b.block];
  });
}