/**
 * ContentList
 * ===========
 *
 * A list of content titles with links to their pages.
 */
'use strict'
let React = require('react')
let asink = require('asink')

let ContentList = React.createClass({
  getInitialState: function () {
    return {
      contentList: []
    }
  },

  setStateFromDattCore: function () {
    return asink(function *() {
      let dattcore = this.props.dattcore
      let DattCore = dattcore.constructor
      let contentauths = yield dattcore.asyncGetRecentContentAuth()
      let contentList = []
      for (let contentauth of contentauths) {
        let key = contentauth.cachehash.toString('hex')
        let address = contentauth.address
        let addressString = yield DattCore.CryptoWorkers.asyncAddressStringFromAddress(contentauth.address)
        let content = contentauth.getContent()
        let title = content.title
        let label = content.label
        let name = content.name
        let body = content.body
        contentList.push({key, address, addressString, title, name, label, body})
      }
      this.setState({contentList})
    }, this)
  },

  componentWillMount: function () {
    this.monitorDattCore()
    return this.setStateFromDattCore()
  },

  componentWillReceiveProps: function () {
    return this.setStateFromDattCore()
  },

  monitorDattCore: function () {
    let dattcore = this.props.dattcore
    dattcore.on('peers-content-auth', this.handlePeersContentAuth)
    dattcore.on('content-content-auth', this.handleContentContentAuth)
  },

  handlePeersContentAuth: function () {
    return this.setStateFromDattCore()
  },

  handleContentContentAuth: function () {
    return this.setStateFromDattCore()
  },

  propTypes: {
    dattcore: React.PropTypes.object
  },

  handleSend: function (address, el) {
    return asink(function *() {
      el.preventDefault()
      let dattcore = this.props.dattcore
      let satoshis = 5000 * 1e2 // 5000 bits converted to satoshis
      yield dattcore.asyncBuildSignAndSendTransaction(address, satoshis)
    }, this)
  },

  render: function () {
    let contentList = this.state.contentList.map(obj => {
      return (
        <li className='content-list-item' key={obj.key}>
          <h2>
            <a href='#'>{obj.title}</a>
          </h2>
          <form>
            <button type='pay' className='btn btn-default' onClick={this.handleSend.bind(this, obj.address)}>Send 5000 Bits</button>
          </form>
          <div className='author-information'>{obj.name} | {obj.addressString}</div>
        </li>
      )
    })
    return (
      <ul className='content-list'>
        {contentList}
      </ul>
    )
  }
})

module.exports = ContentList
