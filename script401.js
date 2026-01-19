// --- 1. Settings & Data ---
let currentUser = null;
let userRole = ''; 
const TOTAL_STUDENTS = 30;

let classroomData = JSON.parse(localStorage.getItem('classroomData')) || [];
if (classroomData.length === 0) {
    classroomData = [{ id: Date.now(), name: "โฮมรูม (ตัวอย่าง)", tasks: [] }];
}

let usersData = JSON.parse(localStorage.getItem('usersData')) || initUsers();

function initUsers() {
    const users = {};
    for(let i=0; i<=30; i++) users[i] = "1234";
    return users;
}

// --- 2. Login ---
function login() {
    const userInp = document.getElementById('username').value;
    const passInp = document.getElementById('password').value;
    const errorMsg = document.getElementById('login-error');

    if (!userInp) { errorMsg.innerText = "กรุณาใส่เลขที่"; return; }
    
    const userId = parseInt(userInp);

    if (usersData[userId] && usersData[userId] === passInp) {
        currentUser = userId;
        setRole();
        
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('app-screen').classList.remove('hidden');
        document.getElementById('display-user').innerText = `User: ${currentUser}`;
        document.getElementById('display-role').innerText = userRole.toUpperCase();
        
        if (userRole === 'admin') document.getElementById('admin-controls').classList.remove('hidden');
        if (currentUser !== 0) document.getElementById('btn-chg-pwd').classList.remove('hidden');
        
        renderBoard();
    } else {
        errorMsg.innerText = "เลขที่หรือรหัสผ่านไม่ถูกต้อง";
    }
}

function setRole() {
    if (currentUser === 20) userRole = 'admin';
    else if (currentUser === 0) userRole = 'viewer';
    else userRole = 'user';
}

function logout() { location.reload(); }

// --- 3. Save & Render ---
function saveData() {
    localStorage.setItem('classroomData', JSON.stringify(classroomData));
    localStorage.setItem('usersData', JSON.stringify(usersData));
    renderBoard();
}

function renderBoard() {
    const board = document.getElementById('board');
    board.innerHTML = ''; 

    classroomData.forEach(subject => {
        const column = document.createElement('div');
        column.className = 'column';

        let tasksHtml = '';
        subject.tasks.forEach(task => {
            const notDoneList = [];
            for(let i=1; i<=30; i++) {
                if (!task.doneBy.includes(i)) notDoneList.push(i);
            }

            // ปุ่มสถานะ
            let actionArea = '';
            if (userRole !== 'viewer') {
                const isDone = task.doneBy.includes(currentUser);
                actionArea = `<button class="btn-submit ${isDone ? 'done' : 'not-done'}" 
                    onclick="toggleStatus(${subject.id}, ${task.id})">
                    ${isDone ? '✅ ส่งแล้ว' : '⭕ ยังไม่ส่ง'}
                </button>`;
            }

            // ปุ่ม Admin
            let adminActions = '';
            if (userRole === 'admin') {
                adminActions = `
                    <div class="card-actions">
                        <button class="icon-btn" onclick="openTaskModal('edit', ${subject.id}, ${task.id})">✏️ แก้ไข</button>
                        <button class="icon-btn" style="color:#c0392b" onclick="deleteTask(${subject.id}, ${task.id})">🗑️ ลบ</button>
                    </div>
                `;
            }

            // *สำคัญ* เพิ่ม Class สี (bg-red, bg-white, ฯลฯ)
            const colorClass = task.color ? `bg-${task.color}` : 'bg-white';

            tasksHtml += `
                <div class="task-card ${colorClass}">
                    ${adminActions}
                    <div class="task-title">${task.title}</div>
                    <div class="task-desc">${task.desc}</div>
                    ${actionArea}
                    <div class="status-section">
                        <span>ค้างส่ง: </span>
                        <span class="pending-list">${notDoneList.length} คน</span>
                    </div>
                </div>
            `;
        });

        const adminColBtns = (userRole === 'admin') 
            ? `<button class="add-task-btn" onclick="openTaskModal('add', ${subject.id})">+ เพิ่มงาน</button>` 
            : '';
        
        const deleteSubBtn = (userRole === 'admin')
            ? `<button class="icon-btn" style="color:red" onclick="deleteSubject(${subject.id})">❌</button>`
            : '';

        column.innerHTML = `
            <div class="column-header">
                ${subject.name}
                ${deleteSubBtn}
            </div>
            <div class="task-list">${tasksHtml}</div>
            ${adminColBtns}
        `;
        board.appendChild(column);
    });
}

// --- 4. Modal Functions ---

function closeModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
}

// เลือกสีใน Modal (คลิกแล้วมีขอบดำ)
function selectColor(element, colorName) {
    // ลบ class 'selected' จากทุกอัน
    document.querySelectorAll('.color-circle').forEach(el => el.classList.remove('selected'));
    // ใส่ 'selected' อันที่กด
    element.classList.add('selected');
    // เก็บค่าลง input hidden
    document.getElementById('modal-task-color').value = colorName;
}

function openTaskModal(mode, subjectId, taskId = null) {
    const modal = document.getElementById('task-modal');
    modal.classList.remove('hidden');
    
    document.getElementById('modal-subject-id').value = subjectId;
    document.getElementById('modal-task-id').value = (taskId) ? taskId : '';

    // รีเซ็ตการเลือกสีเป็นสีขาวก่อนเสมอ
    const circles = document.querySelectorAll('.color-circle');
    circles.forEach(c => c.classList.remove('selected'));
    
    if (mode === 'edit') {
        document.getElementById('modal-title').innerText = "แก้ไขงาน";
        const subject = classroomData.find(s => s.id === subjectId);
        const task = subject.tasks.find(t => t.id === taskId);
        
        document.getElementById('modal-task-name').value = task.title;
        document.getElementById('modal-task-desc').value = task.desc;
        
        // เซ็ตสีเดิมของงาน
        const currentColor = task.color || 'white';
        document.getElementById('modal-task-color').value = currentColor;
        
        // ไฮไลท์วงกลมสีที่ถูกต้อง
        const activeCircle = document.querySelector(`.color-circle.bg-${currentColor}`);
        if(activeCircle) activeCircle.classList.add('selected');

    } else {
        document.getElementById('modal-title').innerText = "เพิ่มงานใหม่";
        document.getElementById('modal-task-name').value = '';
        document.getElementById('modal-task-desc').value = '';
        document.getElementById('modal-task-color').value = 'white';
        // ไฮไลท์สีขาว
        document.querySelector('.color-circle.bg-white').classList.add('selected');
    }
}

function saveTaskFromModal() {
    const subjectId = parseInt(document.getElementById('modal-subject-id').value);
    const taskId = document.getElementById('modal-task-id').value;
    const title = document.getElementById('modal-task-name').value;
    const desc = document.getElementById('modal-task-desc').value;
    const color = document.getElementById('modal-task-color').value; // รับค่าสี

    if(!title) { alert("กรุณาใส่ชื่องาน"); return; }

    const subject = classroomData.find(s => s.id === subjectId);
    
    if (taskId) {
        const task = subject.tasks.find(t => t.id == taskId);
        task.title = title;
        task.desc = desc;
        task.color = color; // บันทึกสี
    } else {
        subject.tasks.push({
            id: Date.now(),
            title: title,
            desc: desc,
            color: color, // บันทึกสี
            doneBy: []
        });
    }

    saveData();
    closeModal('task-modal');
}

// Modal: อื่นๆ (Password, Reset) เหมือนเดิม
function openChangePwdModal() {
    document.getElementById('change-pwd-modal').classList.remove('hidden');
    document.getElementById('old-pass').value = '';
    document.getElementById('new-pass').value = '';
    document.getElementById('confirm-pass').value = '';
}

function changeOwnPassword() {
    const oldPass = document.getElementById('old-pass').value;
    const newPass = document.getElementById('new-pass').value;
    const confirmPass = document.getElementById('confirm-pass').value;

    if (usersData[currentUser] !== oldPass) { alert("รหัสผ่านเดิมไม่ถูกต้อง"); return; }
    if (newPass === '') { alert("กรุณาตั้งรหัสผ่านใหม่"); return; }
    if (newPass !== confirmPass) { alert("รหัสผ่านใหม่ไม่ตรงกัน"); return; }

    usersData[currentUser] = newPass;
    saveData();
    alert("เปลี่ยนรหัสผ่านเรียบร้อย!");
    closeModal('change-pwd-modal');
}

function openUserMgr() {
    document.getElementById('user-modal').classList.remove('hidden');
    document.getElementById('reset-target-user').value = '';
}

function resetPasswordAction() {
    const targetId = parseInt(document.getElementById('reset-target-user').value);
    if(isNaN(targetId) || targetId < 0 || targetId > 30) { alert("ระบุเลขที่ให้ถูกต้อง"); return; }
    if(confirm(`ยืนยันรีเซ็ตเลขที่ ${targetId} เป็น '1234'?`)) {
        usersData[targetId] = "1234";
        saveData();
        alert("เรียบร้อย!");
        closeModal('user-modal');
    }
}

// --- 5. General Actions ---
function addSubject() {
    const name = prompt("ชื่อวิชาใหม่:");
    if(name) {
        classroomData.push({ id: Date.now(), name: name, tasks: []});
        saveData();
    }
}

function deleteSubject(id) {
    if(confirm("ยืนยันลบวิชานี้?")) {
        classroomData = classroomData.filter(s => s.id !== id);
        saveData();
    }
}

function deleteTask(subId, taskId) {
    if(confirm("ลบงานนี้?")) {
        const subject = classroomData.find(s => s.id === subId);
        subject.tasks = subject.tasks.filter(t => t.id !== taskId);
        saveData();
    }
}

function toggleStatus(subId, taskId) {
    if(currentUser === 0) return;
    const subject = classroomData.find(s => s.id === subId);
    const task = subject.tasks.find(t => t.id === taskId);
    
    const idx = task.doneBy.indexOf(currentUser);
    if(idx === -1) {
        task.doneBy.push(currentUser);
        task.doneBy.sort((a,b)=>a-b);
    } else {
        task.doneBy.splice(idx, 1);
    }
    saveData();
}