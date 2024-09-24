// Reference to Firestore
const playersCollection = collection(db, "players");

// Fetch and display leaderboard
function fetchLeaderboard() {
    const leaderboardTable = document.querySelector("#leaderboard tbody");
    leaderboardTable.innerHTML = ''; // Clear the table before updating

    onSnapshot(playersCollection, (snapshot) => {
        snapshot.docs.forEach((doc) => {
            const playerData = doc.data();
            const playerRow = `
                <tr>
                    <td>${playerData.name}</td>
                    <td>${playerData.gamesPlayed}</td>
                    <td>${playerData.gamesWon}</td>
                    <td>${(playerData.winPercentage * 100).toFixed(2)}%</td>
                </tr>
            `;
            leaderboardTable.innerHTML += playerRow;
        });
    });
}

// Add new player to Firestore
function addNewPlayer() {
    const playerName = prompt("Enter new player's name:");
    if (playerName) {
        setDoc(doc(playersCollection, playerName), {
            name: playerName,
            gamesPlayed: 0,
            gamesWon: 0,
            winPercentage: 0
        }).then(() => {
            fetchLeaderboard();
        }).catch((error) => {
            console.error("Error adding player: ", error);
        });
    }
}

// Update player stats
function updatePlayerStats() {
    const playerSelect = document.getElementById("playerSelect");
    const gamesPlayedInput = document.getElementById("gamesPlayedInput").value;
    const gamesWonInput = document.getElementById("gamesWonInput").value;

    const playerName = playerSelect.value;
    const gamesPlayed = parseInt(gamesPlayedInput, 10);
    const gamesWon = parseInt(gamesWonInput, 10);

    if (playerName && !isNaN(gamesPlayed) && !isNaN(gamesWon)) {
        const playerRef = doc(playersCollection, playerName);

        updateDoc(playerRef, {
            gamesPlayed: increment(gamesPlayed),
            gamesWon: increment(gamesWon)
        }).then(() => {
            recalculateWinPercentage(playerName);
        }).catch((error) => {
            console.error("Error updating player stats: ", error);
        });
    } else {
        alert("Please fill all fields.");
    }
}

// Recalculate win percentage for a player
function recalculateWinPercentage(playerName) {
    const playerRef = doc(playersCollection, playerName);

    getDoc(playerRef).then((doc) => {
        if (doc.exists()) {
            const data = doc.data();
            const winPercentage = data.gamesPlayed > 0 ? data.gamesWon / data.gamesPlayed : 0;

            updateDoc(playerRef, {
                winPercentage: winPercentage
            });
        }
    }).catch((error) => {
        console.error("Error recalculating win percentage: ", error);
    });
}

// Populate the player dropdown for selecting a player
function populatePlayerSelect() {
    const playerSelect = document.getElementById("playerSelect");

    onSnapshot(playersCollection, (snapshot) => {
        playerSelect.innerHTML = ''; // Clear the dropdown before updating
        snapshot.docs.forEach((doc) => {
            const playerData = doc.data();
            const option = document.createElement("option");
            option.value = playerData.name;
            option.textContent = playerData.name;
            playerSelect.appendChild(option);
        });
    });
}

// Call fetchLeaderboard and populatePlayerSelect when page loads
fetchLeaderboard();
populatePlayerSelect();
