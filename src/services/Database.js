import { firebaseDatabase } from "./Firebase";

class Database {
  createData(userId) {
    const ref = firebaseDatabase.ref(`users/${userId}/info`);
    ref.once("value", (snapshot) => {
      !snapshot.val() &&
        this.saveData(userId, {
          name: `사용자(${userId.slice(0, 5)})`,
          gender: "　",
          email: "　",
          message: "프로필을 설정해주세요.",
        });
    });
  }

  syncData(userId, onUpdate) {
    const ref = firebaseDatabase.ref(`users/${userId}/info`);
    ref.on("value", (snapshot) => {
      snapshot.val() && onUpdate(snapshot.val());
    });
    return () => ref.off();
  }

  saveData(userId, data) {
    firebaseDatabase.ref(`users/${userId}/info`).set(data);
  }
  //
  //
  bookmarkId(userId) {
    const ref = firebaseDatabase.ref(`users/${userId}/bookmark`);
    let id = 0;
    ref.on("value", (snapshot) => {
      if (snapshot.val()) {
        id = Object.keys(snapshot.val()).length + 1;
      } else {
        id = 1;
      }
    });
    return id;
  }

  syncBookmark(userId, onUpdate) {
    const ref = firebaseDatabase.ref(`users/${userId}/bookmark`);
    ref.on("value", (snapshot) => {
      snapshot.val() && onUpdate(snapshot.val());
      !snapshot.val() && onUpdate({});
    });
    return () => ref.off();
  }

  checkBookmark(userId, id, onCheck) {
    const ref = firebaseDatabase.ref(`users/${userId}/bookmark/${id}`);
    ref.once("value", (snapshot) => {
      if (snapshot.val()) {
        onCheck(true);
      } else {
        onCheck(false);
      }
    });
  }

  saveBookmark(userId, data) {
    firebaseDatabase.ref(`users/${userId}/bookmark/${data.id}`).set(data);
  }

  removeBookmark(userId, id) {
    firebaseDatabase.ref(`users/${userId}/bookmark/${id}`).remove();
  }

  getNickname(userId, setNick) {
    const ref = firebaseDatabase.ref(`users/${userId}`);
    ref.on("value", (snapshot) => {
      if (snapshot.val()) {
        setNick(snapshot.val().info.name);
      }
    });
  }

  getId(onUpdate, from) {
    const ref = firebaseDatabase.ref(`${from}`);
    let id = 0;
    ref.on("value", (snapshot) => {
      if (snapshot.val()) {
        id = snapshot.val().length;
        onUpdate(id);
      } else {
        id = 1;
        onUpdate(id);
      }
    });
    return id;
  }

  saveReport(data, id) {
    firebaseDatabase.ref(`report/${id}`).set(data);
  }

  syncGuestBook(onUpdate) {
    const ref = firebaseDatabase.ref(`guestbook`);
    ref.on("value", (snapshot) => {
      snapshot.val() && onUpdate(snapshot.val());
      !snapshot.val() && onUpdate({});
    });
    return () => ref.off();
  }

  saveSign(id, data) {
    firebaseDatabase.ref(`guestbook/${id}`).set(data);
    firebaseDatabase.ref(`guestbookDB/${id}`).set(data);
  }

  removeSign(signId, userId, toggle) {
    const ref = firebaseDatabase.ref(`guestbook/${signId}`);
    ref.once("value", (snapshot) => {
      if (snapshot.val()) {
        if (snapshot.val().signId === userId) {
          if (window.confirm("정말 삭제하시겠습니까?")) {
            alert("삭제되었습니다.");
            toggle();
            ref.remove();
          }
        } else {
          alert("작성자만 삭제할 수 있습니다.");
        }
      }
    });
  }

  updateSign(userId, nickname) {
    const ref = firebaseDatabase.ref(`guestbook`);
    ref.once("value", (snapshot) => {
      Object.keys(snapshot.val()).forEach((key) => {
        if (snapshot.val()[key].signId === userId) {
          firebaseDatabase.ref(`guestbook/${key}/nickname`).set(nickname);
        }
      });
    });
  }

  signProfile(number, onUpdate) {
    const ref = firebaseDatabase.ref(`guestbook/${number}/signId`);
    ref.on("value", (snapshot) => {
      this.syncData(snapshot.val(), onUpdate);
    });
    return () => ref.off();
  }

  syncLikeCount(usage, onUpdate) {
    const ref = firebaseDatabase.ref(`${usage}/likelist`);
    ref.on("value", (snapshot) => {
      snapshot.val() && onUpdate(Object.keys(snapshot.val()).length);
      !snapshot.val() && onUpdate(0);
    });
    return () => ref.off();
  }

  addLikeCount(usage, userId, data) {
    firebaseDatabase.ref(`${usage}/likelist/${userId}`).set(data);
  }

  subLikeCount(usage, userId) {
    firebaseDatabase.ref(`${usage}/likelist/${userId}`).remove();
  }

  checkIsLiked(usage, userId, onCheck) {
    const ref = firebaseDatabase.ref(`${usage}/likelist/${userId}`);
    ref.on("value", (snapshot) => {
      if (snapshot.val()) {
        onCheck(true);
      } else {
        onCheck(false);
      }
    });
    return () => ref.off();
  }
}

export default Database;
