import request from "../../api/api.js"
import DocumentEditor from "./DocumnetEditor.js"

export default function DocumentEditSection({$target, initialState, onChangeList}) {

    const $section = document.createElement('div')
    $target.appendChild($section)
    
    this.state = initialState

    this.setState = (newState) => {
        this.state = newState

        editor.setState({
            title: this.state.title,
            content: this.state.content
        })
    }

    let timer = null

    const editor = new DocumentEditor({
        $target,
        initialState: this.state,
        onEdit: (post) => {
            const {id} = this.state

            if (id) {
                if (timer) {
                    clearTimeout(timer)
                }

                timer = setTimeout(async () => {
                    await request(`/documents/${id}`, {
                        method: 'PUT',
                        body: JSON.stringify(post)
                    })

                    if (this.state.title !== post.title) {
                        await onChangeList(post)
                    }
                    
                    this.setState({
                        ...this.state,
                        title: post.title,
                        content: post.content
                    })
                }, 1000)
            }
        }
    })
}