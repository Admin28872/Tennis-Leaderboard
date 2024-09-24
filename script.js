// Firebase Configuration (add your own Firebase config here)
var firebaseConfig = {
    apiKey: "AIzaSyDXWQcdlBi_Wavo4GOKs6vX0h15jmf9AeA",
    authDomain: "tennis-leaderboard-13ad8.firebaseapp.com",
    projectId: "tennis-leaderboard-13ad8",
    storageBucket: "tennis-leaderboard-13ad8.appspot.com",
    messagingSenderId: "639496353373",
    appId: "1:639496353373:web:2d7d947cbf336f4b00ffb4"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
var db = firebase.firestore();
var auth = firebase.auth();

// Sign in anonymously
auth.signInAnonymously().catch(function(error) {
    console.log(error.message);
});

// Fetch players and display leaderboard
function fetchLeaderboard() {
    db.collection("players").get().then((querySnapshot) => {
        let players = [];
        querySnapshot.forEach((doc) => {
            players.push(doc.data());
        });
        displayLeaderboard(players);
    });
}

// Display leaderboard by sorting by win percentage
function displayLeaderboard(players) {
    players.sort((a, b) => b.winPercentage - a.winPercentage);

    const leaderboardBody = document.getElementById("leaderboardBody");
    leaderboardBody.innerHTML = "";

    players.forEach((player, index) => {
        let row = leaderboardBody.insertRow();
        row.insertCell(0).innerText = index + 1;
        row.insertCell(1).innerText = player.name;
        row.insertCell(2).innerText = player.gamesPlayed;
        row.insertCell(3).innerText = player.gamesWon;
        row.insertCell(4).innerText = (player.winPercentage * 100).toFixed(2) + '%';
    });

    populatePlayerSelect(players);
}

// Populate player dropdown for updating stats
function populatePlayerSelect(players) {
    const playerSelect = document.getElementById("playerSelect");
    playerSelect.innerHTML = '<option value="">--Select Player--</option>';
    players.forEach((player) => {
        let option = document.createElement("option");
        option.value = player.name;
        option.text = player.name;
        playerSelect.add(option);
    });
}

// Update player stats
function updatePlayerStats() {
    let playerName = document.getElementById("playerSelect").value;
    let gamesPlayed = parseInt(document.getElementById("gamesPlayed").value);
    let gamesWon = parseInt(document.getElementById("gamesWon").value);

    if (playerName && !isNaN(gamesPlayed) && !isNaN(gamesWon)) {
        db.collection("players").doc(playerName).update({
            gamesPlayed: firebase.firestore.FieldValue.increment(gamesPlayed),
            gamesWon: firebase.firestore.FieldValue.increment(gamesWon),
        }).then(() => {
            fetchLeaderboard();
        });
    } else {
        alert("Please fill all fields.");
    }
}

// Add a new player
function addNewPlayer() {
    let playerName = prompt("Enter new player's name:");
    if (playerName) {
        db.collection("players").doc(playerName).set({
            name: playerName,
            gamesPlayed: 0,
            gamesWon: 0,
            winPercentage: 0
        }).then(() => {
            fetchLeaderboard();
        });
    }
}

// Recalculate win percentage after updating stats
function recalculateWinPercentage(playerName) {
    db.collection("players").doc(playerName).get().then((doc) => {
        if (doc.exists) {
            let data = doc.data();
            let winPercentage = data.gamesPlayed > 0 ? data.gamesWon / data.gamesPlayed : 0;
            db.collection("players").doc(playerName).update({
                winPercentage: winPercentage
            });
        }
    });
}

// Listen to changes and recalculate win percentages
db.collection("players").onSnapshot((snapshot) => {
    snapshot.docChanges().forEach((change) => {
        if (change.type === "modified") {
            recalculateWinPercentage(change.doc.id);
        }
    });
    fetchLeaderboard();
});

// Initial fetch of leaderboard
fetchLeaderboard();
