/*
initialState = {title, content:HTML 요소} 
*/
export default function Editor({ $target, initialState, documentAutoSave }) {
  const $editor = document.createElement("section");
  $editor.classList.add("editor");
  $target.appendChild($editor);
  this.state = initialState;
  this.richEditorState = { content: initialState.content };
  this.setState = (nextState) => {
    this.state = nextState;
    this.render();
  };
  //
  $editor.innerHTML = `
  <input class="editor-input" placeholder="제목 없음" data-name="title" />
  <div class="content-wrapper"> 
    <div class="content content-editable" contenteditable="true" placeholder="내용을 입력하쎄용"></div>
  </div>
  `;
  this.render = () => {
    $editor.querySelector("[data-name=title]").value = this.state.title;
  };
  this.renderContent = () => {
    const { content } = this.richEditorState;
    if (content && content.length)
      $editor.querySelector(".content-wrapper").innerHTML = content;
  };
  const makeNewLine = () => {
    const newLine = document.createElement("div");
    newLine.classList.add("content", "content-editable");
    newLine.setAttribute("contenteditable", true);
    newLine.setAttribute("placeholder", "내용을 입력하쎄용");
    return newLine;
  };
  const convertMarkDown = (text) => {
    let isConverted = false;
    const prevText = text.split("\n").join("\n");
    const converted = text
      .split("\n")
      .map((line) => {
        if (line.indexOf("# ") === 0) {
          return `<h1 class="content-editable placeholder-h" 
          placeholder="제목1">${line.substring(2)}</h1>`;
        } else if (line.indexOf("## ") === 0) {
          return `<h2 class="content-editable placeholder-h" 
          placeholder="제목2">${line.substring(3)}</h2>`;
        } else if (line.indexOf("### ") === 0) {
          return `<h3 class="content-editable placeholder-h" 
          placeholder="제목3">${line.substring(4)}</h3>`;
        } else if (line.indexOf("#### ") === 0) {
          return `<h4 class="content-editable placeholder-h" 
          placeholder="제목4">${line.substring(5)}</h4>`;
        }
        return line;
      })
      .join("\n");
    if (prevText !== converted) {
      isConverted = true;
    }
    return [converted, isConverted];
  };

  const keyDownHandler = (e) => {
    //innerHTML수정하면 등록된 핸들러 날아가니까, 이벤트 위임 사용
    //isComposing은 합성글자(한글같은 문자)에대해 체크해준다.
    if (e.isComposing || e.target.tagName === "INPUT") {
      return;
    }
    if (e.target.getAttribute("contenteditable") !== "true") {
      return;
    }
    const enterKeyDown = (e) => {
      //기본 이벤트 막아주고 새 div생성후 형제로 붙여줌
      e.preventDefault();
      const nextLine = makeNewLine();
      e.target.after(nextLine);
      nextLine.focus();
    };
    const backSapceKeyDown = (e) => {
      //안에 내용물이 없는 라인은 위로 포커싱해주고 라인 지워줌
      if (!e.target.innerHTML) {
        e.preventDefault();
        const prevLine = e.target.previousElementSibling;
        if (prevLine) {
          prevLine.focus();
          getSelection().collapse(prevLine, prevLine.childNodes.length);
          e.target.remove();
        }
      }
    };
    switch (e.key) {
      case "Enter":
        enterKeyDown(e);
        break;
      case "Backspace":
        backSapceKeyDown(e);
        break;
      case "ArrowUp":
        e.target.previousElementSibling.focus();
        break;
      case "ArrowDown":
        e.target.nextElementSibling.focus();
        break;
    }
  };
  $editor.addEventListener("keydown", keyDownHandler);
  const onInputHandler = (e) => {
    //여기도 함수 분리 필요...어떻게 한담?
    let nextState = { ...this.state };
    if (e.target.dataset.name === "title") {
      nextState = {
        ...nextState,
        title: e.target.value,
      };
    } else if (e.target.classList.contains("content")) {
      const [converted, isConverted] = convertMarkDown(e.target.innerHTML);
      if (isConverted) {
        e.target.innerHTML = converted;
        e.target.focus();
        getSelection().collapse(e.target.childNodes[0], 0);
      } else if (!e.target.innerHTML) {
        e.target.focus();
        getSelection().collapse(e.target, 0);
      }
      const content = e.target.parentNode.innerHTML;
      nextState = {
        ...nextState,
        content,
      };
    }
    this.setState(nextState);
    const { id, title, content } = this.state;
    const requestBody = { title, content };
    documentAutoSave(id, requestBody);
  };
  $editor.addEventListener("input", onInputHandler);
  this.render();
}
