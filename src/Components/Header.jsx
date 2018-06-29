import React,{Component} from 'react';
import {Box,Icon,SearchField,IconButton,Button,Text} from 'gestalt';
import styled from 'styled-components';
import {Link} from 'react-router-dom';
const HeaderBox=styled.div`
  background-color:white;
  top:0;
  right:0;
  left:0;
  position:fixed;
  padding:12px 16px;
  z-index:1;
  height:64px;
  box-sizing: border-box;
  flex-direction: row;
  align-items: center;
  display: flex;

`

const SearchButton=styled(Link)`
  transition: transform 0.2s ease-out;
  background-color: #efefef;
  border-radius: 8px;
  height: 40px;
  box-sizing: border-box;
  padding-left: 12px;
  padding-right: 12px;
  flex-direction: row;
  display: flex;
  text-decoration: none;
  flex: 1 1 auto;
  align-items: center;
  &:active{
    border:1px solid #bbb;
    padding-left: 11px;
    padding-right: 11px;
  }
`

class Header extends Component{
  state={value:''}
  render(){
    return (
      <div style={{height:64}}>
        <HeaderBox  >
            <SearchButton to="/search_keyword/">
              <Box padding={1} >
                <Icon 
                icon="search"
                size={16}
                accessibilityLabel="Pinterest"
                />
              </Box>
              <Box flex="grow" padding={3} >
                <Text bold color="gray">搜索</Text>
              </Box>
            </SearchButton>
        </HeaderBox>
      </div>
    );
  }
}


export default Header;