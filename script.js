
let attendance = JSON.parse(
    localStorage.getItem("libraryAttendance") || "[]"
);

function saveData() {
    localStorage.setItem(
        "libraryAttendance",
        JSON.stringify(attendance)
    );
}

function displayRecords() {
    const records = document.getElementById("records");
    const search = document.getElementById("search")
        .value.toLowerCase();

    records.innerHTML = "";

    attendance.forEach((student, index) => {
        if (
            student.id.toLowerCase().includes(search) ||
            student.name.toLowerCase().includes(search)
        ) {
            records.innerHTML += `
            <tr>
                <td>${student.id}</td>
                <td>${student.name}</td>
                <td>${student.course}</td>
                <td>${student.date}</td>
                <td>${student.timeIn}</td>
                <td>${student.timeOut || "-"}</td>
                <td class="status">${student.status}</td>
                <td>
                    ${student.status === "Inside" ?
                    `<button class="checkout"
                    onclick="checkOut(${index})">
                    Check Out</button>` : ""}

                    <button class="delete"
                    onclick="deleteRecord(${index})">
                    Delete</button>
                </td>
            </tr>`;
        }
    });

    updateStats();
}

function updateStats() {
    const today = new Date().toLocaleDateString();

    const todayRecords = attendance.filter(
        s => s.date === today
    );

    document.getElementById("total").textContent =
        todayRecords.length;

    document.getElementById("inside").textContent =
        todayRecords.filter(
            s => s.status === "Inside"
        ).length;

    document.getElementById("outside").textContent =
        todayRecords.filter(
            s => s.status === "Checked Out"
        ).length;
}

document.getElementById("attendanceForm")
.addEventListener("submit", function(e) {
    e.preventDefault();

    const id = document.getElementById("studentID")
        .value.trim();

    const name = document.getElementById("studentName")
        .value.trim();

    const course = document.getElementById("course")
        .value.trim();

    const today = new Date().toLocaleDateString();

    const existing = attendance.find(s =>
        s.id.toLowerCase() === id.toLowerCase() &&
        s.date === today &&
        s.status === "Inside"
    );

    if (existing) {
        alert("This student is already checked in!");
        return;
    }

    const now = new Date();

    attendance.push({
        id: id,
        name: name,
        course: course,
        date: today,
        timeIn: now.toLocaleTimeString(),
        timeOut: "",
        status: "Inside"
    });

    saveData();
    displayRecords();
    this.reset();

    alert("Attendance recorded successfully!");
});

function checkOut(index) {
    attendance[index].timeOut =
        new Date().toLocaleTimeString();

    attendance[index].status = "Checked Out";

    saveData();
    displayRecords();

    alert("Student checked out successfully!");
}

function deleteRecord(index) {
    if (confirm("Are you sure you want to delete this record?")) {
        attendance.splice(index, 1);
        saveData();
        displayRecords();
    }
}

function downloadCSV() {
    const headers = [
        "Student ID", "Name", "Course",
        "Date", "Time In", "Time Out", "Status"
    ];

    const rows = attendance.map(s => [
        s.id, s.name, s.course, s.date,
        s.timeIn, s.timeOut, s.status
    ]);

    const csv = [headers, ...rows]
        .map(row => row.map(value =>
            '"' + String(value).replace(/"/g, '""') + '"'
        ).join(","))
        .join("\n");

    const blob = new Blob([csv], {
        type: "text/csv;charset=utf-8;"
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "Library_Attendance.csv";
    link.click();

    URL.revokeObjectURL(link.href);
}

document.getElementById("search")
.addEventListener("input", displayRecords);

displayRecords();
