// import { css, useTheme } from '@emotion/react';
// import styled from '@emotion/styled';
// import {
//   Checkmark16Regular,
//   Comment20Regular,
//   Delete16Regular,
//   Dismiss16Regular,
//   Edit16Regular,
// } from '@fluentui/react-icons';
// import type { Node, NodeViewProps } from '@tiptap/core';
// import { NodeViewContent, NodeViewWrapper } from '@tiptap/react';
// import Color from 'color';
// import { DateTime } from 'luxon';
// import React, { useCallback, useEffect, useRef, useState } from 'react';
// import type { themeType } from '../../../utils/theme/theme';
// import { IconButton } from '../../Button';
// import { TextArea } from '../../TextArea';
// import type { CommentOptions } from './comment';

// interface ICommentContainer extends NodeViewProps {
//   extension: Node<CommentOptions>;
// }

// function CommentContainer(props: ICommentContainer) {
//   const theme = useTheme() as themeType;
//   const messageRef = useRef<HTMLTextAreaElement>(null);
//   const toggleRef = useRef<HTMLSpanElement>(null);

//   // control whether in edit mode
//   const [isEditMode, setIsEditMode] = useState<boolean>(props.node.attrs.message.length === 0);

//   // store message field in state
//   const [message, setMessage] = useState(props.node.attrs.message);

//   // make sure that the textarea height matches the message
//   useEffect(() => {
//     if (messageRef.current) {
//       messageRef.current.style.height = `auto`;
//       messageRef.current.style.height = `${messageRef.current.scrollHeight}px`;
//     }
//   }, [message, isEditMode]);

//   /**
//    * When the user types in the textarea, update the message attribute
//    * with the new message.
//    */
//   const handleCommentMessageChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
//     setMessage(event.currentTarget.value);
//     if (messageRef.current) {
//       messageRef.current.style.height = `auto`;
//       messageRef.current.style.height = `${messageRef.current.scrollHeight}px`;
//     }
//   };

//   /**
//    * Save the comment message changes to the node attributes
//    */
//   const saveCommentMessage = () => {
//     props.updateAttributes({
//       ...props.node.attrs,
//       message: message,
//     });
//   };

//   // control whether the card is shown
//   const [isShown, setIsShown] = useState<boolean>(props.node.attrs.message.length === 0);

//   // track whether mouse is over comment toggle button
//   const [isMouseOverToggle, setIsMouseOverToggle] = useState<boolean>(false);

//   // store the position and size information of the toggle button that executes `toggleCard()`
//   const [triggerRect, setTriggerRect] = useState<DOMRect>();
//   useEffect(() => {
//     if (toggleRef?.current) setTriggerRect(toggleRef.current.getBoundingClientRect());
//   }, [toggleRef, isShown]);

//   // set the textarea height to match the current message height once messageRef is defined and comment is shown
//   useEffect(() => {
//     if (isShown && messageRef.current) {
//       messageRef.current.style.height = `auto`;
//       messageRef.current.style.height = `${messageRef.current.scrollHeight}px`;
//     }
//   }, [isShown, messageRef]);

//   /**
//    * Removes the comment node while keeping the text inside the node.
//    */
//   const unsetComment = useCallback(() => {
//     setIsShown(false);
//     props.editor.commands.unsetLegacyComment(props.getPos() + props.node.nodeSize - 1);
//   }, [props]);

//   /**
//    * Removes the comment if the comment text is empty.
//    */
//   const unsetEmptyComment = useCallback(() => {
//     if (props.node.attrs.message?.length === 0) unsetComment();
//   }, [props.node.attrs.message?.length, unsetComment]);

//   /**
//    * Toggle the card when a button is clicked
//    */
//   const toggleCard = (e: React.MouseEvent) => {
//     setIsShown(!isShown);
//     props.updateAttributes({ alpha: props.node.attrs.alpha < 0.4 ? 0.4 : isMouseOverToggle ? 0.3 : 0.15 });
//   };

//   /**
//    * Listen for any scroll events on the page
//    * and hide the comment card if they occur.
//    */
//   useEffect(() => {
//     const closeOnScroll = () => {
//       setIsShown(false);
//       setIsEditMode(false);
//     };
//     document.addEventListener('scroll', closeOnScroll, true);
//     return document.removeEventListener('scroll', closeOnScroll);
//   }, [setIsShown]);

//   /**
//    * Unsets a comment if it does not contain any comment text and it is hidden.
//    */
//   useEffect(() => {
//     if (!isShown) unsetEmptyComment();
//   }, [isShown, unsetEmptyComment]);

//   return (
//     <NodeViewWrapper as={`span`}>
//       <NodeViewContent
//         as={`span`}
//         style={{ backgroundColor: Color(props.node.attrs.color).alpha(props.node.attrs.alpha) }}
//       ></NodeViewContent>
//       <span style={{ position: 'absolute', marginLeft: -5, marginTop: 24 }} ref={toggleRef} />
//       <ToggleCardButton
//         icon={<Comment20Regular />}
//         onClick={toggleCard}
//         onMouseEnter={() => {
//           if (props.editor.isEditable) {
//             setIsMouseOverToggle(true);
//             if (!isShown) props.updateAttributes({ alpha: 0.3 });
//           }
//         }}
//         onMouseLeave={() => {
//           if (props.editor.isEditable) {
//             setIsMouseOverToggle(false);
//             if (!isShown) props.updateAttributes({ alpha: 0.15 });
//           }
//         }}
//       />
//       {isShown ? (
//         <Card theme={theme} contentEditable={false} triggerRect={triggerRect || new DOMRect()}>
//           {isEditMode ? null : (
//             <>
//               <IconButton
//                 icon={<Edit16Regular />}
//                 color={'neutral'}
//                 cssExtra={css`
//                   position: absolute;
//                   top: 9px;
//                   right: 65px;
//                   border-color: transparent;
//                   background-color: transparent;
//                   width: 28px;
//                   height: 28px;
//                   span {
//                     display: flex;
//                   }
//                   svg {
//                     width: 18px !important;
//                     height: 18px !important;
//                   }
//                 `}
//                 onClick={() => {
//                   setMessage(props.node.attrs.message);
//                   setIsEditMode(true);
//                 }}
//                 disabled={props.editor.isEditable}
//               />
//               <IconButton
//                 icon={<Delete16Regular />}
//                 color={'red'}
//                 cssExtra={css`
//                   position: absolute;
//                   top: 9px;
//                   right: 37px;
//                   border-color: transparent;
//                   background-color: transparent;
//                   width: 28px;
//                   height: 28px;
//                   span {
//                     display: flex;
//                   }
//                   svg {
//                     width: 18px !important;
//                     height: 18px !important;
//                   }
//                 `}
//                 onClick={unsetComment}
//                 disabled={props.editor.isEditable}
//               />
//               <IconButton
//                 icon={<Dismiss16Regular />}
//                 color={'neutral'}
//                 cssExtra={css`
//                   position: absolute;
//                   top: 9px;
//                   right: 9px;
//                   border-color: transparent;
//                   background-color: transparent;
//                   width: 28px;
//                   height: 28px;
//                   span {
//                     display: flex;
//                   }
//                   svg {
//                     width: 16px !important;
//                     height: 16px !important;
//                   }
//                 `}
//                 onClick={toggleCard}
//                 disabled={props.editor.isEditable}
//               />
//             </>
//           )}
//           <ProfilePhoto theme={theme} src={props.node.attrs.commenter.photo} contentEditable={false} />
//           <ProfilePhotoBorder theme={theme} contentEditable={false} />
//           <Commenter theme={theme} contentEditable={false}>
//             {props.node.attrs.commenter.name}
//           </Commenter>

//           {isEditMode ? (
//             <>
//               <MessageField
//                 theme={theme}
//                 onChange={isEditMode ? handleCommentMessageChange : undefined}
//                 rows={1}
//                 value={message}
//                 ref={messageRef}
//                 placeholder={`Type a comment`}
//                 disabled={!props.editor.isEditable}
//               />
//               <ButtonRow>
//                 <CommentIconButton
//                   theme={theme}
//                   color={'neutral'}
//                   icon={<Dismiss16Regular />}
//                   onClick={() => {
//                     // hide comment container if there is no new message or old message
//                     if (props.node.attrs.message.length === 0 && message.length === 0) setIsShown(false);
//                     // otherwise, exit edit mode, which will cause the new message to be lost
//                     setIsEditMode(false);
//                   }}
//                   disabled={!props.editor.isEditable}
//                 />
//                 <CommentIconButton
//                   theme={theme}
//                   color={'primary'}
//                   icon={<Checkmark16Regular />}
//                   onClick={(e) => {
//                     setIsEditMode(false);
//                     saveCommentMessage();
//                   }}
//                   disabled={!props.editor.isEditable}
//                 />
//               </ButtonRow>
//             </>
//           ) : (
//             <>
//               <Message theme={theme}>{props.node.attrs.message}</Message>
//               <Timestamp theme={theme} contentEditable={false}>
//                 {DateTime.fromISO(props.node.attrs.timestamp).toFormat(`LLL. dd, yyyy, t`)}
//               </Timestamp>
//             </>
//           )}
//           <div
//             contentEditable={false}
//             style={{
//               color: theme.color.danger[800],
//               fontFamily: theme.font.detail,
//               fontSize: 13,
//               lineHeight: 1.1,
//               marginTop: 10,
//             }}
//           >
//             This a legacy comment. It is no longer supported. This comment may behave unexpectedly.
//           </div>
//         </Card>
//       ) : null}
//     </NodeViewWrapper>
//   );
// }

// const ToggleCardButton = styled(IconButton)`
//   height: 18px;
//   width: 18px;
//   position: absolute;
//   display: inline-flex;
//   margin-top: -8px;
//   margin-left: -5px;
//   padding: 2px;
//   background-color: transparent;
//   border-color: transparent;
//   &:hover,
//   &:active {
//     background-color: #e0e0e0;
//     border-color: rgba(148, 148, 148, 0.2);
//   }
//   &:hover:active {
//     background-color: #dddddd;
//     border-color: rgba(148, 148, 148, 0.25);
//   }
// `;

// const Card = styled.div<{ theme: themeType; triggerRect: DOMRect }>`
//   position: fixed;
//   background: ${({ theme }) => (theme.mode === 'light' ? 'white' : theme.color.neutral[theme.mode][200])};
//   box-sizing: border-box;
//   padding: 12px 16px;
//   margin: 0;
//   width: 280px;
//   box-shadow: rgb(0 0 0 / 13%) 0px 1.6px 3.6px 0px, rgb(0 0 0 / 11%) 0px 0.3px 0.9px 0px,
//     ${({ theme }) => Color(theme.color.primary[800]).alpha(0.065).string()} -1px 1.6px 3.6px 0px,
//     ${({ theme }) => Color(theme.color.primary[800]).alpha(0.055).string()} 0.3px 0.3px 0.9px 0px;
//   border: 1px solid ${({ theme }) => theme.color.primary[800]};
//   top: ${({ triggerRect }) => triggerRect.y + triggerRect.height}px;
//   left: ${({ triggerRect }) =>
//     triggerRect.x + 300 > document.body.offsetWidth ? document.body.offsetWidth - 300 : triggerRect.x}px;
//   border-radius: ${({ theme }) => theme.radius};
//   *::selection {
//     background-color: transparent !important;
//   }
//   z-index: 99999999;
// `;

// const ProfilePhoto = styled.img<{ theme: themeType }>`
//   width: 24px;
//   height: 24px;
//   border-radius: ${({ theme }) =>
//     `calc(${theme.radius} - 0.6px) ${theme.radius} ${theme.radius} calc(${theme.radius} - 0.6px)`};
//   box-shadow: white 0 0 0 0.6px;
//   position: absolute;
//   top: 9px;
//   left: -12px;
//   z-index: 1;
// `;

// const ProfilePhotoBorder = styled.div<{ theme: themeType }>`
//   position: absolute;
//   border-radius: ${({ theme }) => `calc(${theme.radius} - 0.6px) 0 0 calc(${theme.radius} - 0.6px)`};
//   box-shadow: ${({ theme }) => theme.color.primary[800]} 0px 0px 0px 1.4px,
//     rgb(0 0 0 / 13%) 1.4px 1.6px 3.6px 0px, rgb(0 0 0 / 11%) 0px 0.3px 0.9px 1.4px,
//     ${({ theme }) => Color(theme.color.primary[800]).alpha(0.13).string()} -1px 1.6px 3.6px 1.4px,
//     ${({ theme }) => Color(theme.color.primary[800]).alpha(0.11).string()} 0.3px 0.3px 0.9px 1.4px;
//   width: 10px;
//   height: 24px;
//   top: 9px;
//   left: -12px;
// `;

// const Commenter = styled.div<{ theme: themeType }>`
//   display: flex;
//   font-size: 16px;
//   line-height: 16px;
//   font-family: ${({ theme }) => theme.font.detail};
//   font-weight: 600;
//   color: ${({ theme }) => theme.color.neutral[theme.mode][1200]};
// `;

// const ButtonRow = styled.div`
//   display: flex;
//   flex-direction: row;
//   gap: 6px;
//   align-items: center;
//   justify-content: flex-end;
// `;

// const CommentIconButton = styled(IconButton)<{ theme: themeType }>`
//   background-color: transparent;
//   border-color: ${({ theme }) => theme.color.neutral[theme.mode][800]} !important;
//   width: 40px;
//   height: 28px;
//   > span {
//     display: flex;
//     > svg {
//       width: 16px;
//       height: 16px;
//     }
//   }
// `;

// const Timestamp = styled.div<{ theme: themeType }>`
//   display: flex;
//   font-size: 11px;
//   line-height: 11px;
//   font-family: ${({ theme }) => theme.font.detail};
//   color: ${({ theme }) => theme.color.neutral[theme.mode][800]};
// `;

// const MessageField = styled(TextArea)<{ theme: themeType }>`
//   display: flex;
//   resize: none;
//   overflow-y: hidden;
//   width: calc(100%);
//   margin: 10px 0;
//   &::selection {
//     background-color: #c4dffc !important;
//   }
// `;

// const Message = styled.div<{ theme: themeType }>`
//   display: flex;
//   font-size: 14px;
//   line-height: 16px;
//   font-family: ${({ theme }) => theme.font.detail};
//   color: ${({ theme }) => theme.color.neutral[theme.mode][1200]};
//   margin: 8px 0 6px 0;
//   white-space: break-spaces;
// `;

// export { CommentContainer };
