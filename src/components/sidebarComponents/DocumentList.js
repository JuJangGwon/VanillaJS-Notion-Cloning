import { push } from "../../utils.js";

export default function DocumentList({
  $target,
  initialState,
  onAdd,
  onDelete,
}) {
  const $documentList = document.createElement("section");
  $target.appendChild($documentList);

  this.state = initialState;

  this.setState = (nextState) => {
    this.state = nextState;
    this.render();
  };

  const listItemButtons = `
    <div class="list-item-buttons">
      <button class="delete-button" type="button">
        <i class="fa-regular fa-trash-can delete-button"></i>
      </button>
      <button class="add-button" type="button">
        <i class="fa-solid fa-plus add-button"></i>
      </button>
    </div>
  `;

  const renderList = (nextDocuments, depth) => `
    ${nextDocuments
      .map(
        ({ id, title, documents }) => `
            <ul class="document-list">
              <li data-id="${id}" class="list-item" style="padding-left: ${
          depth * 10
        }px;">
                <div data-id=${id} class="toggle-and-title">
                  <i class="fa-solid fa-angle-right toggle-button"></i>
                  <span class="list-item-title">
                  ${(title ?? "제목 없음") || (title === "" && "제목 없음")}
                  </span>
                  </div>
                      ${listItemButtons}
              </li>
                ${
                  documents.length === 0
                    ? `<li class="list-item" style="padding-left: ${
                        (depth + 2) * 10
                      }px;">
                   하위 페이지 없음
                    </li>`
                    : renderList(documents, depth + 2)
                }
                    </ul>
                  `
      )
      .join("")}
  `;

  this.render = () => {
    const { documents } = this.state;
    $documentList.innerHTML = `
           ${documents.length > 0 ? renderList(documents, 1) : ""}
        `;
  };

  $documentList.addEventListener("click", async (event) => {
    // event.stopPropagation();
    const { target } = event;
    console.dir(target.classList);
    const $li = target.closest(".list-item");

    let { id } = $li.dataset;
    console.log(id);
    id = parseInt(id);
    // this.state.selectedDocumentId = id;

    if (target.classList.contains("delete-button")) {
      onDelete(id);
    } else if (target.classList.contains("add-button")) {
      // 하위 document 생성 로직
      onAdd(id);
    } else if (
      target.className === "list-item" ||
      ("list-item-title" && !isNaN(id))
    ) {
      // document 조회 로직
      push(`${id}`);

      // this.setState({
      //   ...this.state,
      //   selectedDocumentId: id,
      // });
    }
  });

  this.render();
}
