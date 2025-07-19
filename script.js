const steelData = [
  {
    name: "S235JR",
    thicknessLimit: 400,
    chemistry: { C: 0.17, Si: 0.35, Mn: 1.40, P: 0.035, S: 0.035, N: 0.012, Cu: 0.55 },
    mechanical: [
      { maxT: 3, yieldMin: 235, tensile: [360, 510], elong: 26 },
      { maxT: 100, yieldMin: 225, tensile: [360, 510], elong: 25 },
      { maxT: 150, yieldMin: 215, tensile: [340, 490], elong: 24 },
      { maxT: 400, yieldMin: 215, tensile: [330, 480], elong: 24 },
    ]
  },
  {
    name: "S275JR",
    thicknessLimit: 400,
    chemistry: { C: 0.21, Si: 0.35, Mn: 1.50, P: 0.035, S: 0.035, N: 0.012, Cu: 0.55 },
    mechanical: [
      { maxT: 3, yieldMin: 275, tensile: [410, 560], elong: 23 },
      { maxT: 100, yieldMin: 265, tensile: [410, 560], elong: 22 },
      { maxT: 150, yieldMin: 255, tensile: [380, 540], elong: 21 },
      { maxT: 400, yieldMin: 255, tensile: [380, 540], elong: 21 },
    ]
  },
  {
    name: "S355JR",
    thicknessLimit: 400,
    chemistry: { C: 0.24, Si: 0.55, Mn: 1.60, P: 0.035, S: 0.035, N: 0.012, Cu: 0.55 },
    mechanical: [
      { maxT: 3, yieldMin: 355, tensile: [470, 630], elong: 22 },
      { maxT: 100, yieldMin: 345, tensile: [470, 630], elong: 21 },
      { maxT: 150, yieldMin: 335, tensile: [450, 600], elong: 20 },
      { maxT: 400, yieldMin: 335, tensile: [450, 600], elong: 20 },
    ]
  },
  {
    name: "S460J0",
    thicknessLimit: 400,
    chemistry: { C: 0.20, Si: 0.50, Mn: 1.70, P: 0.025, S: 0.025, N: 0.012, Cu: 0.55 },
    mechanical: [
      { maxT: 16, yieldMin: 460, tensile: [540, 720], elong: 17 },
      { maxT: 40, yieldMin: 440, tensile: [540, 720], elong: 17 },
      { maxT: 63, yieldMin: 420, tensile: [540, 720], elong: 17 },
      { maxT: 100, yieldMin: 410, tensile: [530, 710], elong: 17 },
      { maxT: 150, yieldMin: 400, tensile: [530, 710], elong: 17 },
      { maxT: 200, yieldMin: 390, tensile: [530, 710], elong: 17 },
      { maxT: 250, yieldMin: 380, tensile: [530, 710], elong: 17 },
      { maxT: 400, yieldMin: 370, tensile: [530, 710], elong: 17 },
    ]
  },
  {
    name: "S500J0",
    thicknessLimit: 400,
    chemistry: { C: 0.20, Si: 0.45, Mn: 1.70, P: 0.025, S: 0.025, N: 0.012, Cu: 0.55 },
    mechanical: [
      { maxT: 3, yieldMin: 500, tensile: [580, 760], elong: 17 },
      { maxT: 100, yieldMin: 480, tensile: [580, 760], elong: 17 },
      { maxT: 150, yieldMin: 460, tensile: [550, 750], elong: 17 },
      { maxT: 400, yieldMin: 460, tensile: [550, 750], elong: 17 },
    ]
  }
];

function analyzeSteel() {
  const t = parseFloat(document.getElementById("thickness").value);
  const fy = parseFloat(document.getElementById("yield").value);
  const fu = parseFloat(document.getElementById("tensile").value);
  const a = parseFloat(document.getElementById("elongation").value);
  const chem = {
    C: parseFloat(document.getElementById("C").value),
    Si: parseFloat(document.getElementById("Si").value),
    Mn: parseFloat(document.getElementById("Mn").value),
    P: parseFloat(document.getElementById("P").value),
    S: parseFloat(document.getElementById("S").value),
    N: parseFloat(document.getElementById("N").value),
    Cu: parseFloat(document.getElementById("Cu").value),
  };

  const resultDiv = document.getElementById("result");
  if ([t, fy, fu, a, ...Object.values(chem)].some(v => isNaN(v))) {
    resultDiv.innerHTML = "❌ من فضلك أدخل جميع القيم بشكل صحيح.";
    return;
  }

  function getMechanicalLimit(mechList, thickness) {
    return mechList.find(lim => thickness <= lim.maxT) || null;
  }

  let chemicalMatches = [];

  for (const steel of steelData) {
    if (t > steel.thicknessLimit) continue;

    let chemValid = true;
    for (let el in chem) {
      if (chem[el] > steel.chemistry[el]) {
        chemValid = false;
        break;
      }
    }

    if (chemValid) {
      const mech = getMechanicalLimit(steel.mechanical, t);
      if (!mech) continue;

      const mechValid =
        fy >= mech.yieldMin &&
        fu >= mech.tensile[0] &&
        fu <= mech.tensile[1] &&
        a >= mech.elong;

      let diff = Math.abs(fy - mech.yieldMin) + Math.abs(fu - ((mech.tensile[0] + mech.tensile[1]) / 2)) + Math.abs(a - mech.elong);

      chemicalMatches.push({
        name: steel.name,
        mechanicalValid: mechValid,
        mechDiff: mechValid ? diff : Infinity
      });
    }
  }

  if (chemicalMatches.length === 0) {
    resultDiv.innerHTML = "❌ لا يوجد نوع مطابق كيميائيًا.";
    return;
  }

  const mechMatches = chemicalMatches.filter(m => m.mechanicalValid);
  let bestMech = null;

  if (mechMatches.length > 0) {
    bestMech = mechMatches.reduce((prev, curr) => (curr.mechDiff < prev.mechDiff ? curr : prev));
  }

  let html = `<h3>✅ الأنواع المطابقة كيميائيًا:</h3><ul>`;
  for (const match of chemicalMatches) {
    if (bestMech && match.name === bestMech.name) {
      html += `<li><strong>${match.name}</strong> ✅ مطابق كيميائيًا وميكانيكيًا (الأقرب)</li>`;
    } else {
      html += `<li>${match.name} 🧪 مطابق كيميائيًا فقط</li>`;
    }
  }
  html += `</ul>`;

  resultDiv.innerHTML = html;
}
