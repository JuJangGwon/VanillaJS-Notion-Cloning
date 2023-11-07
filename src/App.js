import EditPage from './EditComponents/EditPage.js';
import SideNav from './SideNavComponents/SideNav.js';
import { request } from './utils/api.js';
import { initRouter, push } from './utils/router.js';
import { addStorage, getStorage, removeStorage } from './utils/storage.js';

export default function App({ $target }) {
  // 상태 관리
  this.state = {
    docsTree: [],
    selectedDoc: {
      ...getStorage('selectedDoc', null),
    },
    currentFocus: {
      id: null,
      element: null,
    },
  };

  this.setState = (nextState) => {
    this.state = nextState;

    sideNav.setState(nextState);
    editPage.setState(nextState);

    this.render();
  };

  this.render = () => {};

  // 사이드 네비바
  const sideNav = new SideNav({
    $target,
    initialState: this.state,
    // 추가 버튼
    onClickPlusBtn: async (id) => {
      const newDoc = await request(`/documents`, {
        method: 'POST',
        body: JSON.stringify({
          title: ``,
          // parent가 null이면 루트 Document가 됩니다.
          // 특정 Document에 속하게 하려면 parent에
          // 해당 Document id를 넣으세요.
          parent: id === 'root' ? null : Number(id),
        }),
      });

      await request(`/documents/${newDoc.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          content: '',
        }),
      });

      fetchDocTree();
      // 해당 페이지 에디터 열기
      const doc = await request(`/documents/${newDoc.id}`, {
        method: 'GET',
      });

      addStorage('selectedDoc', doc);
      push(`/documents/${newDoc.id}`);
      this.setState({
        ...this.state,
        selectedDoc: doc,
      });
    },

    // 삭제 버튼
    onClickDeleteBtn: async (id) => {
      const deleteDoc = await request(`/documents/${id}`, {
        method: 'DELETE',
      });

      fetchDocTree();
      // 삭제시 부모 문서로 이동 or 홈 화면 이동
      if (deleteDoc.parent) {
        const parentDocId = deleteDoc.parent.id;

        const parentDoc = await request(`/documents/${parentDocId}`, {
          method: 'GET',
        });

        addStorage('selectedDoc', parentDoc);
        push(`/documents/${parentDocId}`);
        this.setState({
          ...this.state,
          selectedDoc: parentDoc,
        });
      } else {
        removeStorage('selectedDoc');
        push('/');
        this.setState({
          ...this.state,
          selectedDoc: {},
        });
      }
    },

    // 문서 클릭
    onClickDoc: async (id) => {
      const doc = await request(`/documents/${id}`, {
        method: 'GET',
      });

      addStorage('selectedDoc', doc);
      push(`/documents/${id}`);
      this.setState({
        ...this.state,
        selectedDoc: doc,
      });
    },

    // 메인 클릭
    onClickMain: () => {
      removeStorage('selectedDoc');
      push('/');
      this.setState({
        ...this.state,
        selectedDoc: {},
      });
    },
    // 토글버튼 클릭
    onClickToggleBtn: async (id) => {
      const doc = await request(`/documents/${id}`, {
        method: 'GET',
      });
      const { documents } = doc;

      const $navButton = document.querySelector(
        `.nav-toggle-btn[data-id="${id}"]`
      );

      const closeList = getStorage('close', []);
      const hideList = getStorage('hide', []);

      // 자식 문서 보여주기
      const showChild = (parentNode) => {
        if (parentNode.length !== 0) {
          parentNode.forEach((child) => {
            const $childNav = document.querySelector(
              `.nav-document-container[data-id="${child.id}"]`
            );

            if ($childNav) {
              const hideId = hideList.indexOf(id);

              hideList.splice(hideId, 1);

              addStorage('hide', hideList);
            }

            showChild(child.documents);
          });
        }
      };
      // 자식 문서 숨기기
      const hideChild = (parentNode) => {
        if (parentNode.length !== 0) {
          parentNode.forEach((child) => {
            const $childNav = document.querySelector(
              `.nav-document-container[data-id="${child.id}"]`
            );

            if ($childNav) {
              const hideId = hideList.indexOf(id);

              if (hideId === -1) {
                hideList.push(child.id.toString());
              }

              addStorage('hide', hideList);
            }

            hideChild(child.documents);
          });
        }
      };

      if ($navButton.classList.contains('toggled')) {
        $navButton.classList.remove('toggled');
        closeList.push(id);
        addStorage('close', closeList);

        $navButton.innerHTML = '▶';

        hideChild(documents);
      } else {
        $navButton.classList.add('toggled');
        $navButton.innerHTML = '▼';

        const removeId = closeList.indexOf(id);
        closeList.splice(removeId, 1);
        addStorage('close', closeList);

        showChild(documents);
      }

      fetchDocTree();
    },
  });

  // edit Page
  const editPage = new EditPage({
    $target,
    initialState: this.state,
    onEditDoc: (nextState) => {
      this.setState(nextState);
    },
    onClick: async (clickedId) => {
      const doc = await request(`/documents/${clickedId}`, {
        method: 'GET',
      });

      addStorage('selectedDoc', doc);
      push(`/documents/${clickedId}`);
      this.setState({
        ...this.state,
        selectedDoc: doc,
      });
    },
  });

  // 전체 DocTree 가져오기
  const fetchDocTree = async () => {
    const docs = await request('/documents', {
      method: 'GET',
    });

    this.setState({
      ...this.state,
      docsTree: docs,
    });
  };

  fetchDocTree();

  // 라우팅
  this.route = async () => {
    const { pathname } = window.location;
    // 메인화면
    if (pathname === '/') {
      removeStorage('selectedDoc');
      this.setState({
        ...this.state,
        selectedDoc: {},
      });
    } // 문서 id 접속
    else if (pathname.indexOf('/documents/') === 0) {
      const [, , documentId] = pathname.split('/');

      try {
        const doc = await request(`/documents/${documentId}`, {
          method: 'GET',
        });

        if (!doc) {
          throw new Error(
            '해당 페이지를 없는 페이지입니다. 메인 화면으로 돌아가시겠습니까?'
          );
        }

        this.setState({
          ...this.state,
          selectedDoc: doc,
          currentFocus: {
            id: null,
            element: null,
          },
        });

        const currentStorage = getStorage('selectedDoc', {});

        if (Object.keys(currentStorage).length !== 0) {
          addStorage('selectedDoc', currentStorage);
        }
      } catch (e) {
        const check = confirm(e.message);

        if (check) {
          push('/');
          removeStorage('selectedDoc');
          this.setState({
            ...this.state,
            selectedDoc: {},
            currentFocus: {
              id: null,
              element: null,
            },
          });
        }
      }
    }
  };

  this.route();
  // 라우팅 url 변경
  initRouter(() => this.route());

  // 뒤로가기 & 앞으로가기
  window.addEventListener('popstate', () => {
    this.route();
  });
}
