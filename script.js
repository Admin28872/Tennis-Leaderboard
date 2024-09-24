// Firestore reference to the "players" collection
const playersCollection = collection(db, "players");

// Fetch and display leaderboard data in real-time
function fetchLeaderboard() {
    const leaderboardTable = document.querySelector("#leaderboard tbody");
    leaderboardTable.innerHTML = ''; // Clear the table before updating

    onSnapshot(playersCollection, (snapshot) => {
        leaderboardTable.innerHTML = ''; // Clear the table again to avoid duplicates
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

// Add a new player to Firestore
function addNewPlayer() {
    const playerName = prompt("Enter new player's name:");
    if (playerName) {
        const playerRef = doc(playersCollection, playerName);
        setDoc(playerRef, {
            name: playerName,
            gamesPlayed: 0,
            gamesWon: 0,
            winPercentage: 0
        }).then(() => {
            fetchLeaderboard(); // Refresh the leaderboard after adding a new player
        }).catch((error) => {
            console.error("Error adding player: ", error);
        });
    }
}

// Update player stats (games played and games won)
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

// Recalculate and update player's win percentage
function recalculateWinPercentage(playerName) {
    const playerRef = doc(playersCollection, playerName);

    getDoc(playerRef).then((docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            const winPercentage = data.gamesPlayed > 0 ? data.gamesWon / data.gamesPlayed : 0;

            updateDoc(playerRef, {
                winPercentage: winPercentage
            }).then(() => {
                fetchLeaderboard(); // Refresh the leaderboard after updating stats
            });
        }
    }).catch((error) => {
        console.error("Error recalculating win percentage: ", error);
    });
}

// Populate the player dropdown with names from Firestore
function populatePlayerSelect() {
    const playerSelect = document.getElementById("playerSelect");

    onSnapshot(playersCollection, (snapshot) => {
        playerSelect.innerHTML = ''; // Clear the dropdown
        snapshot.docs.forEach((doc) => {
            const playerData = doc.data();
            const option = document.createElement("option");
            option.value = playerData.name;
            option.textContent = playerData.name;
            playerSelect.appendChild(option);
        });
    });
}

// Initial load: fetch the leaderboard and populate player selection dropdown
fetchLeaderboard();
populatePlayerSelect();
