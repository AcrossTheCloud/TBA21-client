import React from 'react'
// import 'styles/components/stories.scss';
import 'styles/components/stories.scss';
const BlogItem = ({title}) => <div>
    <p className='stories-item__title'>{title}</p>
    <p>Karin</p>
    <p>sdjflksadjf sadfjasl lsdkfjaskljlsd fsaldkf sadf saldkfjsaj sdlffasj sdlfk;fs dflkasj dfkl;sdfj sl;dfaksajsa;f kfj sd lksdjfj dffj sadlf</p>
</div>

const Stories = () => <div>{[1,2,3,4,5,6].map(val => <BlogItem key={val} title={"Ocean archive"}></BlogItem>)}</div>

export default Stories



