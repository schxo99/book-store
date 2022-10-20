// exports
const pool = require("../../middleware/db");

exports.signin = async (req, res) => {
    try {
        // 여기서 세션의 존재를 확인하는 이유는, 로그인 된 상태로 'user/signin'에 접속 했을 때,
        // 해당 세션 정보를 지우고 메인 페이지로 돌아간다.
        // 즉, 로그아웃 버튼을 눌렀을 때, signin을 이용하여 저장된 세션 값을 삭제하고 메인화면으로 돌아갈 수 있다.
        // 게다가 로그인이 된 상태로 로그인 웹 페이지에 들어올 수 있는 경우를 미리 차단
        if (req.session.uid) {
            // 현재 세션의 uid를 삭제
            delete req.session.uid;
            // 세션 수정 후 redirect
            req.session.save(function () {
                res.redirect("/");
            });
        } else {
            // 저장된 세션이 없으면 signin 페이지로 이동
            res.render("signin");
        }
    } catch (error) {
        console.log(error);
    }
};

exports.login = async (req, res) => {
    try {
        // ejs의 입력 값을 controller로 받아오기
        const { uid, upw } = req.body;
        // ejs에서 입력받은 id를 이용하여 데이터베이스에서 사용자 정보 가져오기
        let user = await pool.query("SELECT * FROM user where user_id = ?", [
            uid,
        ]);
        // 데이터베이스에서 가져온 사용자 정보를 id와 pw로 구분
        // 만약 데이터베이스에 해당 id가 없을 경우 [] 형태를 가져오기에 user[0][0].user_id를 사용하면 에러가 난다.
        // 따라서 데이터베이스에서 가져온 사용자 정보 배열의 길이를 체크해야한다.
        if (user[0].length !== 0) {
            let user_id = user[0][0].user_id;
            let user_pw = user[0][0].user_pw;
            // 사용자가 입력한 id / pw가 데이터베이스에 저장된 id / pw와 같으면 세션에 uid 삽입 및 저장 그리고 메인 페이지로 돌아가기
            if (uid === user_id && upw === user_pw) {
                req.session.uid = uid;
                req.session.save();
                // session에 값을 추가/삭제 한 후에는 res.render 대신 res.redirect를 사용해야함
                return res.redirect("/");
            } else {
                // 아니라면 로그인 페이지로 새로고침
                return res.redirect("/user/signin");
            }
        } else {
            // 사용자가 입력한 아이디가 데이터베이스에 없다면
            return res.redirect("/user/signin");
        }
    } catch (error) {
        console.log(error);
    }
};

exports.signup = async (req, res) => {
    try {
        res.render("signup", {
            signinStatus: false,
        });
    } catch (error) {
        console.log(error);
    }
};

exports.register = async (req, res) => {
    try {
        const { uid, upw, uname } = req.body;
        const user_info = await pool.query(
            "insert into user (user_id, user_pw, user_name) values(?, ?, ?)",
            [uid, upw, uname]
        );
        return res.redirect("/");
    } catch (error) {
        console.log(error);
    }
};

// module.exports = router;
