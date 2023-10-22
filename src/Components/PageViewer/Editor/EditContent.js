import { controlKey } from "../../../Event/ControlKey.js";
import converterToHtml from "../../../Function/ConverterToHtml.js";
import CreateEditDOM from "./CreateEditDOM.js";

export default function EditContent({ target, state }) {
  const editContentElement = document.createElement("div");
  editContentElement.focus();
  editContentElement.setAttribute("class", "pageViewer_editor_content");
  editContentElement.setAttribute("data-name", "content");
  target.appendChild(editContentElement);

  this.state = state;

  this.setState = (newState) => {
    this.state = newState;
    this.render();
  };

  this.render = () => {
    editContentElement.replaceChildren();
    if (!this.state || this.state.length === 0) {
      console.log(this.state);
      new CreateEditDOM({
        target: editContentElement,
      });
      new CreateEditDOM({
        className: "h2",
        target: editContentElement,
      });
      return;
    }

    const splited = this.state.split("<cut>");

    splited.forEach((item) => {
      converterToHtml({
        state: item,
        target: editContentElement,
      });
    });
  };

  /* 특수키 Event */
  editContentElement.addEventListener("keydown", (event) => {
    controlKey({
      event,
      target: editContentElement,
    });
  });
}
