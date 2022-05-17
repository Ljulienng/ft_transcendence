let SessionLoad = 1
let s:so_save = &g:so | let s:siso_save = &g:siso | setg so=0 siso=0 | setl so=-1 siso=-1
let v:this_session=expand("<sfile>:p")
silent only
silent tabonly
cd /sgoinfre/goinfre/Perso/agautier/ft_transcendence/back
if expand('%') == '' && !&modified && line('$') <= 1 && getline(1) == ''
  let s:wipebuf = bufnr('%')
endif
set shortmess=aoO
argglobal
%argdel
$argadd src/pong/pong.service.ts
set stal=2
tabnew
tabnew
tabnew
tabrewind
edit src/pong/pong.module.ts
argglobal
balt src/pong/dto/create-pong.dto.ts
setlocal fdm=manual
setlocal fde=0
setlocal fmr={{{,}}}
setlocal fdi=#
setlocal fdl=0
setlocal fml=1
setlocal fdn=20
setlocal fen
silent! normal! zE
let &fdl = &fdl
let s:l = 1 - ((0 * winheight(0) + 15) / 31)
if s:l < 1 | let s:l = 1 | endif
keepjumps exe s:l
normal! zt
keepjumps 1
normal! 040|
tabnext
edit src/pong/interfaces/pong.interface.ts
argglobal
balt src/pong/pong.gateway.ts
setlocal fdm=manual
setlocal fde=0
setlocal fmr={{{,}}}
setlocal fdi=#
setlocal fdl=0
setlocal fml=1
setlocal fdn=20
setlocal fen
silent! normal! zE
let &fdl = &fdl
let s:l = 10 - ((9 * winheight(0) + 15) / 31)
if s:l < 1 | let s:l = 1 | endif
keepjumps exe s:l
normal! zt
keepjumps 10
normal! 0
tabnext
edit src/pong/pong.service.ts
argglobal
balt src/pong/pong.gateway.ts
setlocal fdm=manual
setlocal fde=0
setlocal fmr={{{,}}}
setlocal fdi=#
setlocal fdl=0
setlocal fml=1
setlocal fdn=20
setlocal fen
silent! normal! zE
9,9fold
9,9fold
9,11fold
9,11fold
13,36fold
13,36fold
13,36fold
13,36fold
38,41fold
74,74fold
74,83fold
85,92fold
38,93fold
let &fdl = &fdl
9
normal! zo
9
normal! zo
9
normal! zo
9
normal! zo
9
normal! zc
13
normal! zo
13
normal! zo
13
normal! zo
38
normal! zo
38
normal! zo
74
normal! zo
let s:l = 57 - ((13 * winheight(0) + 15) / 31)
if s:l < 1 | let s:l = 1 | endif
keepjumps exe s:l
normal! zt
keepjumps 57
normal! 034|
tabnext
edit src/pong/pong.gateway.ts
argglobal
balt src/pong/pong.service.ts
setlocal fdm=manual
setlocal fde=0
setlocal fmr={{{,}}}
setlocal fdi=#
setlocal fdl=0
setlocal fml=1
setlocal fdn=20
setlocal fen
silent! normal! zE
let &fdl = &fdl
let s:l = 41 - ((28 * winheight(0) + 15) / 31)
if s:l < 1 | let s:l = 1 | endif
keepjumps exe s:l
normal! zt
keepjumps 41
normal! 03|
tabnext 3
set stal=1
badd +0 src/pong/pong.module.ts
badd +57 src/pong/pong.service.ts
badd +34 src/pong/pong.gateway.ts
badd +9 src/pong/pong.controller.ts
badd +18 src/pong/interfaces/pong.interface.ts
badd +1 src/pong/dto/create-pong.dto.ts
if exists('s:wipebuf') && len(win_findbuf(s:wipebuf)) == 0 && getbufvar(s:wipebuf, '&buftype') isnot# 'terminal'
  silent exe 'bwipe ' . s:wipebuf
endif
unlet! s:wipebuf
set winheight=1 winwidth=20 shortmess=filnxtToOF
let s:sx = expand("<sfile>:p:r")."x.vim"
if filereadable(s:sx)
  exe "source " . fnameescape(s:sx)
endif
let &g:so = s:so_save | let &g:siso = s:siso_save
doautoall SessionLoadPost
unlet SessionLoad
" vim: set ft=vim :
