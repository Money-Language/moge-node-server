# MOGE-NODE-SERVER

## 🖥 기능

### **📱 회원가입**

![Untitled](https://user-images.githubusercontent.com/57697624/203929921-5e84b07f-9c15-4cbd-a3f4-2f6e53fe15ca.png)

![Untitled](https://user-images.githubusercontent.com/57697624/203930046-9558688f-a8ab-449d-8337-ccd3ce8dca73.png)

![Untitled](https://user-images.githubusercontent.com/57697624/203930160-9413e936-43bb-4cd8-96ef-0c186137372e.png)

- 최초 접속 시 스플래시 화면이 뜨고 로그인 화면으로 이동됨 (소셜로그인도 가능)
- 회원가입 시, 이메일과 비밀번호를 입력하고 이메일 인증을 받음
- 그 후, 5개 키워드 중 3개를 선택하면 회원가입 완료

<br>

### **📱 내 정보**

![Untitled](https://user-images.githubusercontent.com/57697624/203930583-9a33f840-8c17-4461-8b4c-2570280b0df7.png)

- 자신이 작성한 내 퀴즈, 내 피드(일상글), 내 좋아요(자신이 좋아요 표시한 게시글)를 볼 수 있음

<br>

### **📱 홈 화면**

![Untitled](https://user-images.githubusercontent.com/57697624/203930992-5dc00dd7-218b-4bd0-aa77-3a15046387c0.png)

- 퀴즈 오답 복습, 오늘의 퀴즈( 하루 랜덤 1문제씩 출제 ) 기능 구현
- 자신이 관심 키워드로 지정한 퀴즈 게시물을 최신순 & 조회순 & 인기순 내림차순으로 조회 가능
- 해당 화면에서 자신이 회원 가입했을 때 설정했던 관심 키워드 변경 가능

<br>

### **📱 퀴즈 탐색**

![Untitled](https://user-images.githubusercontent.com/57697624/203931117-f75ccdf9-0bf7-4242-bb60-7a5ec1ecb1ce.png)

- 조회수와 좋아요가 많은 게시글을 1위부터 10위까지 볼 수 있음
- 키워드가 포함된 게시글들을 검색해서 조회 가능

<br>

### **📱 퀴즈 풀기 (객관식 / 주관식)**

**1️⃣ 객관식**

![Untitled](https://user-images.githubusercontent.com/57697624/203931410-86f60b3f-04ff-4e70-94f9-cbaf4708be66.png)

**2️⃣ 주관식**

![Untitled](https://user-images.githubusercontent.com/57697624/203931497-fc8e4fd9-7d4e-4b85-b818-0cbf51a5ac34.png)

- 게시글에 적재되어 있는 퀴즈들은 1~15문제로 구성. 객관식과 주관식 형태로 되어 있음
- 문제 오답 시, 오답복습 이력에 적재되고 문제 정답 시, 각 문제당 10포인트 획득

<br>

### **📱 퀴즈 신고**

![Untitled](https://user-images.githubusercontent.com/57697624/203931648-0e673f2b-5566-4616-8c98-6c57534e94a6.png)

- 퀴즈에 이상 있을 시, 신고하기 기능을 통해 코멘트 입력 후 신고 가능
- 한 문제 당, 신고 횟수가 3번 이상 누적 시 해당 문제는 자동 비활성화 처리

<br>

### **📱 퀴즈 댓글**

![Untitled](https://user-images.githubusercontent.com/57697624/203931757-1ce73853-60ed-4f5d-a9b6-b6f4b820118a.png)

- 퀴즈가 들어있는 게시글에 댓글로 반응을 나타낼 수 있음
- 댓글에 대댓글 구현 기능
- 댓글에 공감 또는 마음에 들었을 때, 좋아요로 공감 표시 가능
- 댓글에 이상이 있을 시, 신고 가능. 신고가 3번 이상 누적되면 해당 댓글 비활성화 처리

<br>

### **📱 퀴즈 등록 (객관식 / 주관식)**

**1️⃣ 객관식**

![Untitled](https://user-images.githubusercontent.com/57697624/203931897-9cad9f56-d353-489d-9269-463e47af6364.png)

**2️⃣ 주관식**

![Untitled](https://user-images.githubusercontent.com/57697624/203931975-336a34c1-7c0d-471e-ac95-475e96bb7e05.png)

- 객관식/주관식 선택 가능, 최대 15문제까지 출제 가능

<br>

---

## 🛠 기술 & 라이브러리

- **Front-end :** Android
- **Back-end :** Spring, Node.js, MySql
- **Deployment :** AWS EC2, AWS RDS, AWS S3, Ngnix
- **Team-collaboration :** Notion, Github, Figma, Spreadsheet, AQueryTool
- **Tools :** IntelliJ, Visual Studio Code, WorkBench, DataGrip

---

## 🔊 언어

- Kotlin
- Java
- JavaScript
- SQL

---

## 📝 본인 담당 기능 - Node.js Server Developer

- **Part :**

  - 카카오 / 네이버 소셜 계정 회원가입 & 로그인 구현
  - 내 정보 - 자신이 등록한 게시글, 자신이 지정한 카테고리 별 게시글 조회
  - 게시글 - 게시글 CRUD, 최신순/조회순/인기순 필터링 정렬, 카테고리 별 게시글 조회
  - 퀴즈 - 퀴즈 CRUD, 퀴즈 신고 CRUD 구현
  - 오늘의 퀴즈 ( 하루마다 랜덤 문제 한 문제씩 출제 ) 기능 구현
  - 오답 복습 ( 틀린 퀴즈 문제는 날짜별로 저장 ) CRUD 기능 구현

- **Tech Stack :**
  - Node.js, MySQL
  - AWS EC2, AWS RDS, AWS S3, Ngnix
  - Notion, Github, Figma, Spreadsheet, AQueryTool
  - Visual Studio Code, DataGrip

---

## 📪 서버 협업 프로젝트 결과물

### 🛠 ERD 설계도

- 비밀번호

  - Password : 47p6nh

    > [AQueryTool](https://aquerytool.com/aquerymain/index/?rurl=d321eb6b-84aa-4dbe-88e6-65d4863f829e&)

- 이미지 파일

![moge_erd_광역범위_캡처](https://user-images.githubusercontent.com/57697624/203932700-699a10e2-58e0-4fc2-98cc-8d15e491eaf0.png)

### 📝 REST API 명세서

    ※ 남은 작업이 있는 관계로 현재는 비공개

#### 🔗 REST API 링크

- 로컬 테스트 링크 : http://localhost:3000
- 개발용 서버 링크 : https://dev.wani-softsquared.shop
- 배포용 서버 링크 : https://prod.wani-softsquared.shop

---

## 📃 Source Code

[GitHub - Money-Language/moge-node-server](https://github.com/Money-Language/moge-node-server)

---

## **📑 프로젝트 구상 배경**

![image](https://user-images.githubusercontent.com/57697624/203932945-fe7dbe34-29d5-43f8-8068-11c7bc664325.png)

![image](https://user-images.githubusercontent.com/57697624/203933053-f61a4b0f-ea63-44ce-bba5-ad38865e3a3e.png)

![image](https://user-images.githubusercontent.com/57697624/203933248-bb70674e-fec9-4b15-89e2-6229d79edf09.png)

![image](https://user-images.githubusercontent.com/57697624/203933347-59708ed5-4669-43b1-995e-0f5046ae8da6.png)

![image](https://user-images.githubusercontent.com/57697624/203933431-dc7466e1-d938-4c5b-8233-d9740eb24686.png)

![image](https://user-images.githubusercontent.com/57697624/203933502-a6796ebb-50f7-47ba-b923-38aa286951aa.png)

---

## 🏆 수상

- **최우수상** : [ MakeUs Challenge ] CMC & CX 2기 챌린저 데모데이
