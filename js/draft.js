// Mock Draft tab.

let currentDraftRound = 1;
let userPicks = [];

function renderDraftBoard() {
  const board = document.getElementById("prospects-board");
  const roundLabel = document.getElementById("active-round-label");

  if (currentDraftRound > 3) {
    roundLabel.textContent = "DRAFT COMPLETE!";
    roundLabel.className = "bg-emerald-600 text-white text-[10px] font-heading font-bold px-2.5 py-0.5 rounded uppercase tracking-wider";
    board.innerHTML = `
      <div class="bg-panthers-black/60 border border-emerald-500/50 p-4 rounded-lg text-center">
        <h3 class="text-base font-heading font-bold text-emerald-400 mb-1">🎉 3-ROUND MOCK DRAFT COMPLETE!</h3>
        <p class="text-panthers-silver text-xs">Review your completed draft class and grade on the right panel.</p>
      </div>
    `;
    return;
  }

  const pickNumbers = { 1: "PICK #19", 2: "PICK #51", 3: "PICK #83" };
  roundLabel.textContent = `ROUND ${currentDraftRound} • ${pickNumbers[currentDraftRound]}`;
  roundLabel.className = "bg-panthers-blue text-white text-[10px] font-heading font-bold px-2.5 py-0.5 rounded uppercase tracking-wider";

  const availableProspects = draftProspects.filter(p => p.round === currentDraftRound && !userPicks.some(up => up.id === p.id));

  let boardHTML = "";
  availableProspects.forEach(p => {
    boardHTML += `
      <div class="bg-panthers-black/60 border border-panthers-cardBorder p-3 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-panthers-blue transition-colors">
        <div>
          <div class="flex items-center gap-2 mb-0.5">
            <span class="bg-panthers-blue/20 text-panthers-blue border border-panthers-blue text-[9px] font-heading font-bold px-1.5 py-0.5 rounded">${p.pos}</span>
            <span class="text-panthers-silver text-xs font-semibold">${p.school}</span>
          </div>
          <h3 class="font-heading font-bold text-white text-base">${p.name}</h3>
          <p class="text-panthers-silver text-xs">${p.desc}</p>
        </div>
        <button onclick="draftProspect(${p.id})" class="bg-panthers-blue hover:bg-panthers-blueHover text-white font-heading font-bold px-3 py-1.5 rounded text-xs uppercase tracking-wider shadow-md whitespace-nowrap">
          DRAFT PLAYER ↗
        </button>
      </div>
    `;
  });

  board.innerHTML = boardHTML;
}

function draftProspect(prospectId) {
  const prospect = draftProspects.find(p => p.id === prospectId);
  if (prospect) {
    userPicks.push(prospect);
    currentDraftRound++;
    renderDraftBoard();
    updateDraftClassUI();
  }
}

function autoSimDraft() {
  userPicks = [
    draftProspects.find(p => p.round === 1),
    draftProspects.find(p => p.round === 2),
    draftProspects.find(p => p.round === 3)
  ];
  currentDraftRound = 4;
  renderDraftBoard();
  updateDraftClassUI();
}

function resetDraftSim() {
  userPicks = [];
  currentDraftRound = 1;
  renderDraftBoard();
  updateDraftClassUI();
}

// One grading scale used for both individual picks and the overall class
const GRADE_SCALE = [
  { min: 93, letter: "A+", tone: "emerald", summary: "Elite draft class! Addressed key team needs with premier talent." },
  { min: 90, letter: "A",  tone: "emerald", summary: "Excellent class with multiple immediate-impact players." },
  { min: 87, letter: "A-", tone: "emerald", summary: "Strong class with high starting potential." },
  { min: 83, letter: "B+", tone: "amber",   summary: "Solid class with good value and depth." },
  { min: 80, letter: "B",  tone: "amber",   summary: "Decent additions for roster depth." },
  { min: 0,  letter: "B-", tone: "amber",   summary: "A few useful pieces, but few difference-makers." }
];

const GRADE_TONES = {
  emerald: { text: "text-emerald-400", badge: "bg-emerald-950/60 text-emerald-400 border border-emerald-500" },
  amber:   { text: "text-amber-400",   badge: "bg-amber-950/60 text-amber-400 border border-amber-500" }
};

function gradeFor(value) {
  return GRADE_SCALE.find(g => value >= g.min);
}

function updateDraftClassUI() {
  const classContainer = document.getElementById("user-draft-class");
  const gradeBadge = document.getElementById("draft-class-grade");
  const gradeSummary = document.getElementById("draft-grade-summary");

  if (userPicks.length === 0) {
    classContainer.innerHTML = `<p class="text-panthers-silver text-xs italic">No prospects selected yet. Click "Draft Player" on the left board to build your draft class!</p>`;
    gradeBadge.textContent = "--";
    gradeSummary.textContent = "Make your selections to evaluate team fit and value.";
    return;
  }

  let classHTML = "";
  let totalGrade = 0;

  userPicks.forEach((p, idx) => {
    totalGrade += p.gradeVal;
    const pickGrade = gradeFor(p.gradeVal);
    classHTML += `
      <div class="bg-panthers-black/60 border border-panthers-cardBorder p-2.5 rounded-lg flex justify-between items-center">
        <div>
          <span class="text-[9px] text-panthers-blue font-heading font-bold uppercase block">R${idx + 1} PICK • ${p.pos}</span>
          <h4 class="font-heading font-bold text-white text-xs">${p.name}</h4>
          <span class="text-[9px] text-panthers-silver block">${p.school}</span>
        </div>
        <span class="${GRADE_TONES[pickGrade.tone].badge} font-mono text-[10px] px-1.5 py-0.5 rounded">GRADE: ${pickGrade.letter}</span>
      </div>
    `;
  });

  classContainer.innerHTML = classHTML;

  const overall = gradeFor(totalGrade / userPicks.length);
  gradeBadge.textContent = overall.letter;
  gradeBadge.className = `text-3xl font-heading font-extrabold ${GRADE_TONES[overall.tone].text} block`;
  gradeSummary.textContent = overall.summary;
}
