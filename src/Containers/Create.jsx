import React, { Component } from 'react';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Image, Box, Text, Button, IconButton, TextArea } from 'gestalt';
import HeaderContainer from '../Components/HeaderContainer';
import styled from 'styled-components';
import * as configActs from '../actions/config';

import hiddenFooter from '../Components/HiddenFooter';
import AddPhoto from '../Components/AddPhoto';
import { imageUrl } from '_tools';
import Markdown from 'com_/Markdown';
import Edit from 'com_/Edit';
const CreteHeader = ({ goBack }) => (
  <HeaderContainer>
    <Box marginLeft={-3}>
      <IconButton accessibilityLabel="返回" icon="arrow-back" onClick={goBack} />
    </Box>
    <Box flex="grow">
      <Text bold size="lg">
        创作
      </Text>
    </Box>
    <Box>
      <Button type="submit" text="发布" size="sm" color="red" />
    </Box>
  </HeaderContainer>
);
class Create extends Component {
  state = {
    addPhoto: false,
    errorOpen: false,
    message: '',
    type: 'article',
    photos: [],
    content: '',
    thumbnail: '',
  };
  addPhoto(data) {
    delete data.__typename;
    if (!this.state.thumbnail) {
      this.setState({ thumbnail: data.url });
    }

    this.setState({ photos: this.state.photos.concat([data]), type: 'photo' });
  }
  render() {
    let {
      mutate,
      history: { goBack, push },
      setSelfAct,
    } = this.props;
    return (
      <div>
        <form
          onSubmit={e => {
            e.preventDefault();
            mutate({
              variables: {
                type: this.state.type,
                content: this.state.content,
                photos: this.state.photos,
                thumbnail: this.state.thumbnail,
              },
            })
              .then(({ data }) => {
                //setSelfAct({name:this.state.name,token:data.data.login});
                //goBack()
                push(`/Post/${data.addPost}`);
              })
              .catch(err => {
                console.log(err);
                this.setState({
                  message: err.graphQLErrors[0].message,
                  errorOpen: true,
                });
              });
          }}
        >
          <CreteHeader goBack={goBack} />
          <Box paddingX={4} direction="column" display="flex">
            <Box paddingY={2} flex="grow">
              {this.state.photos.map((item, key) => {
                return (
                  <Image
                    key={key}
                    alt="创作"
                    color="#fff"
                    naturalHeight={item.height}
                    naturalWidth={item.width}
                    src={imageUrl(item.url)}
                  />
                );
              })}
              <Edit
                value={this.state.content}
                onChange={evt => {
                  this.setState({ content: evt.target.value });
                }}
              />
              <Markdown source={this.state.content} />
            </Box>
          </Box>
          {/* <div style={{height:56}}>
          <Box color="white" direction="row" display="flex"  position="fixed" left={true} right={true} bottom={true} paddingY={2} paddingX={4}>
          <Box marginLeft={-3}>
            <IconButton
            accessibilityLabel="Love"
            bgColor="white"
            icon="camera"
            onClick={()=>{
              this.setState({addPhoto:true})
            }}
            />
          </Box>
          <Box marginLeft={2}>
            <IconButton
            accessibilityLabel="Love"
            bgColor="white"
            icon="sound"
            />
          </Box>
          <Box marginLeft={2}>
            <IconButton
            accessibilityLabel="Love"
            bgColor="white"
            icon="play"
            />
          </Box>
          </Box>
        </div>*/}
        </form>
        {this.state.addPhoto && (
          <AddPhoto
            onDismiss={() => this.setState({ addPhoto: false })}
            addPhoto={this.addPhoto.bind(this)}
          />
        )}
      </div>
    );
  }
}

export default graphql(gql`
  mutation addPost($type: String!, $photos: [PhotoInput!], $content: String, $thumbnail: String) {
    addPost(input: { content: $content, type: $type, photos: $photos, thumbnail: $thumbnail })
  }
`)(hiddenFooter(Create));
